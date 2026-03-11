package main.services.impl;

import main.dtos.request.ConfirmPostTripRequest;
import main.dtos.request.PostTripConditionRequest;
import main.dtos.response.PostTripConditionResponse;
import main.dtos.response.*;
import main.entities.Booking;
import main.entities.BookingTripCondition;
import main.enums.*;
import main.repositories.BookingRepository;
import main.repositories.BookingTripConditionRepository;
import main.services.PaymentTransactionService;
import main.entities.*;
import main.enums.FuelLevel;
import main.enums.PostTripConfirmationStatus;
import main.repositories.*;
import main.dtos.request.CreateBookingRequest;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.mappers.BookingMapper;
import main.mappers.CarMapper;
import main.services.BookingService;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.beans.factory.annotation.Value;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final PaymentTransactionService paymentTransactionService;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final BookingCarRepository bookingCarRepository;
    private final CarRepository carRepository;
    private final CarTypeRepository carTypeRepository;
    private final AccountRepository accountRepository;
    private final BookingTripConditionRepository tripConditionRepository;
    @Value("${app.upload.dir:uploads}")
    private String uploadDir;

    //===DEFINE BUSINESS RULES:====
    private static final int IDAER = 1; // invalid days after each rental
    private static final int MINIMUM_RENTAL_HOURS = 5; // minimum 5 hours rental
    private static final BigDecimal DEPOSIT_PERCENTAGE = new BigDecimal("0.30"); // 30% deposit
    private static final BigDecimal OVERDUE_MULTIPLIER = new BigDecimal("1.50"); // 1.5x overdue rate
    private static final List<BookingStatus> BLOCKING_STATUSES = List.of(
            BookingStatus.CREATED,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS
    );

    //set = 0 if dont want to apply
    private static final BigDecimal DAMAGE_FEE_MINOR   = new BigDecimal("500000");  // rating ≥ 3, has notes
    private static final BigDecimal DAMAGE_FEE_MAJOR   = new BigDecimal("2000000"); // rating < 3
    //=============================

    @Override
    @Transactional
    public BookingResponse createBooking(CreateBookingRequest request, UUID accountId) {

        LocalDateTime pickup = request.getExpectedReceiveDate();
        LocalDateTime returnDt = request.getExpectedReturnDate();
        
        // Validate dates
        if (!pickup.isBefore(returnDt)) {
            throw new IllegalArgumentException("Return date must be after pickup date");
        }
        
        // Validate minimum rental period (5 hours)
        long hours = Duration.between(pickup, returnDt).toHours();
        if (hours < MINIMUM_RENTAL_HOURS) {
            throw new IllegalArgumentException("Minimum rental period is " + MINIMUM_RENTAL_HOURS + " hours");
        }
        
        // Validate quantity
        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }
        
        // Validate car type exists
        if (!carTypeRepository.existsById(request.getCarTypeId())) {
            throw new IllegalArgumentException("Car type not found: " + request.getCarTypeId());
        }
        
        // Find available cars
        List<UUID> availableCarIds = findAvailableCarIds(request.getCarTypeId(), pickup, returnDt);
        
        if (availableCarIds.size() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough cars available. Only " + availableCarIds.size() + " available.");
        }
        
        // Take only the required quantity
        List<UUID> selectedCarIds = availableCarIds.subList(0, request.getQuantity());

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("Account not found"));

        // Create booking
        Booking booking = Booking.builder()
                .account(account)
                .expectedReceiveDate(pickup)
                .expectedReturnDate(returnDt)
                .status(BookingStatus.CREATED)
                .build();

        Booking savedBooking = bookingRepository.save(booking);

        // Assign cars to this booking
        List<Car> cars = carRepository.findAllById(selectedCarIds);
        List<BookingCar> bookingCars = cars.stream()
                .map(car -> BookingCar.builder()
                        .booking(savedBooking)
                        .car(car)
                        .build())
                .toList();
        List<CarResponse> carResponses = CarMapper.toResponseList(cars);

        bookingCarRepository.saveAll(bookingCars);

        // Calculate and update booking price
        BigDecimal bookingPrice = calculateBookingPrice(cars, pickup, returnDt);
        BigDecimal depositAmount = bookingPrice.multiply(DEPOSIT_PERCENTAGE);
        BigDecimal remainingAmount = bookingPrice.subtract(depositAmount);
        
        savedBooking.setBookingPrice(bookingPrice);
        savedBooking.setTotalPrice(bookingPrice);
        savedBooking.setDepositAmount(depositAmount);
        savedBooking.setRemainingAmount(remainingAmount);
        bookingRepository.save(savedBooking);

        // Create payment transaction for deposit (not full price)
        PaymentTransactionResponse payment = null;
        if (request.isPayNow()) {
            payment = paymentTransactionService.createPayment(
                    savedBooking.getId(),
                    PaymentPurpose.BOOKING_PAYMENT,
                    depositAmount  // Pay deposit, not full price
            );
        }

        // Build response
        BookingResponse response = bookingMapper.toBookingResponseDto(savedBooking);
        if (payment != null) {
            response.setPayments(List.of(payment));
        }
        response.setCars(carResponses);
        return response;
    }
    
    /**
     * Find available car IDs for a car type within the specified date range
     */
    private List<UUID> findAvailableCarIds(UUID carTypeId, LocalDateTime pickup, LocalDateTime returnDt) {
        // Get all cars for this car type
        List<Car> allCars = carRepository.findByCarTypeId(carTypeId);
        
        if (allCars.isEmpty()) {
            return new ArrayList<>();
        }
        
        List<UUID> allCarIds = allCars.stream().map(Car::getId).toList();
        
        // Apply IDAER buffer
        LocalDateTime bufferedPickup = pickup.minusDays(IDAER);
        LocalDateTime bufferedReturn = returnDt.plusDays(IDAER);
        
        // Find unavailable cars
        List<UUID> unavailableCarIds = bookingCarRepository.findUnavailableCarIds(
                allCarIds,
                bufferedPickup,
                bufferedReturn,
                BLOCKING_STATUSES
        );
        
        // Return available car IDs
        return allCarIds.stream()
                .filter(id -> !unavailableCarIds.contains(id))
                .toList();
    }

    private BigDecimal calculateBookingPrice(List<Car> cars, LocalDateTime pickup, LocalDateTime returnDt) {
        // Calculate total duration
        long totalMinutes = Duration.between(pickup, returnDt).toMinutes();
        long days = totalMinutes / (24 * 60);
        long remainingHours = (totalMinutes % (24 * 60)) / 60;
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        
        for (Car car : cars) {
            BigDecimal hourlyRate = car.getCarType().getPrice();
            BigDecimal dailyRate = hourlyRate.multiply(BigDecimal.valueOf(24));
            
            // Price = (days × dailyRate) + (remainingHours × hourlyRate)
            BigDecimal carPrice = dailyRate.multiply(BigDecimal.valueOf(days))
                    .add(hourlyRate.multiply(BigDecimal.valueOf(remainingHours)));
            
            totalPrice = totalPrice.add(carPrice);
        }
        
        return totalPrice;
    }


    @Override
    public BookingResponse getBookingById(UUID bookingId) {

        // Fetch booking by id
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Fetch cars associated with this booking
        List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(bookingId);
        List<Car> cars = bookingCars.stream()
                .map(BookingCar::getCar)
                .toList();
        
        // Map booking to response
        BookingResponse response = bookingMapper.toBookingResponseDto(booking);
        
        // Set cars
        response.setCars(CarMapper.toResponseList(cars));
        
        // Set payments
        response.setPayments(paymentTransactionService.getAllByBookingId(bookingId));
        
        return response;
    }

    @Override
    public List<BookingResponse> getMyBookings(UUID accountId) {
        // Fetch all bookings for the account, ordered by creation date (newest first)
        List<Booking> bookings = bookingRepository.findByAccountIdOrderByCreatedAtDesc(accountId);
        
        // Map each booking to BookingResponse with cars and payments
        return bookings.stream()
                .map(booking -> {
                    // Fetch cars associated with this booking
                    List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(booking.getId());
                    List<Car> cars = bookingCars.stream()
                            .map(BookingCar::getCar)
                            .toList();
                    
                    // Map booking to response
                    BookingResponse response = bookingMapper.toBookingResponseDto(booking);
                    
                    // Set cars
                    response.setCars(CarMapper.toResponseList(cars));
                    
                    // Set payments
                    response.setPayments(paymentTransactionService.getAllByBookingId(booking.getId()));
                    
                    return response;
                })
                .toList();
    }

    @Override
    public void cancelBooking(UUID bookingId) {

        // TODO: fetch booking
        // TODO: validate cancellation rules
        // TODO: update status to CANCELED
        // TODO: handle payment cancel/refund if needed

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AdminBookingResponse> getAllBookings(Specification<Booking> specification, Pageable pageable) {
        Page<Booking> bookingPage = bookingRepository.findAll(specification, pageable);
        return bookingPage.map(this::toAdminBookingResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AdminBookingResponse getAdminBookingById(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return toAdminBookingResponse(booking);
    }

    @Override
    @Transactional
    public AdminBookingResponse confirmPickup(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking must be in CONFIRMED status to confirm pickup. Current: " + booking.getStatus());
        }

        // Reject pickup if more than 1 day past expected pickup date
        if (booking.getExpectedReceiveDate() != null
                && LocalDateTime.now().isAfter(booking.getExpectedReceiveDate().plusDays(1))) {
            throw new IllegalStateException(
                    "Cannot confirm pickup — the booking is overdue by more than 1 day past the expected pickup date and will be auto-cancelled.");
        }

        booking.setActualReceiveDate(LocalDateTime.now());
        booking.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepository.save(booking);

        return toAdminBookingResponse(booking);
    }

    @Override
    @Transactional
    public AdminBookingResponse confirmReturn(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Booking must be in IN_PROGRESS status to confirm return. Current: " + booking.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setActualReturnDate(now);

        LocalDateTime expectedReturn = booking.getExpectedReturnDate();

        if (now.isAfter(expectedReturn)) {
            // Overdue — calculate charges
            long overdueMinutes = Duration.between(expectedReturn, now).toMinutes();
            long overdueHours = (long) Math.ceil(overdueMinutes / 60.0);

            // Fetch cars for this booking
            List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(bookingId);
            List<Car> cars = bookingCars.stream().map(BookingCar::getCar).toList();

            // Sum hourly rates across all cars
            BigDecimal totalHourlyRate = BigDecimal.ZERO;
            for (Car car : cars) {
                totalHourlyRate = totalHourlyRate.add(car.getCarType().getPrice());
            }

            // overdueCharge = overdueHours × totalHourlyRate × OVERDUE_MULTIPLIER
            BigDecimal overdueCharge = BigDecimal.valueOf(overdueHours)
                    .multiply(totalHourlyRate)
                    .multiply(OVERDUE_MULTIPLIER);

            booking.setOverdueCharge(overdueCharge);
            booking.setTotalPrice(booking.getBookingPrice().add(overdueCharge));
            booking.setRemainingAmount(booking.getRemainingAmount().add(overdueCharge));
            // Keep IN_PROGRESS until overdue payment is made
            bookingRepository.save(booking);

            // Create overdue payment transaction via PayOS
            paymentTransactionService.createPayment(
                    bookingId,
                    PaymentPurpose.OVERDUE_PAYMENT,
                    overdueCharge
            );
        } else {
            // On time or early — complete the booking
            booking.setStatus(BookingStatus.COMPLETED);
            bookingRepository.save(booking);
        }

        return toAdminBookingResponse(booking);
    }

    /**
     * Helper: Convert Booking entity to AdminBookingResponse
     */
    private AdminBookingResponse toAdminBookingResponse(Booking booking) {
        List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(booking.getId());
        List<Car> cars = bookingCars.stream()
                .map(BookingCar::getCar)
                .toList();

        AdminBookingResponse response = new AdminBookingResponse();
        response.setId(booking.getId());
        response.setCars(CarMapper.toResponseList(cars));
        response.setTotalPrice(booking.getTotalPrice());
        response.setBookingPrice(booking.getBookingPrice());
        response.setDepositAmount(booking.getDepositAmount());
        response.setRemainingAmount(booking.getRemainingAmount());
        response.setOverdueCharge(booking.getOverdueCharge());
        response.setStatus(booking.getStatus());
        response.setActualReceiveDate(booking.getActualReceiveDate());
        response.setActualReturnDate(booking.getActualReturnDate());
        response.setCreatedAt(booking.getCreatedAt() != null
                ? LocalDateTime.ofInstant(booking.getCreatedAt(), java.time.ZoneId.systemDefault())
                : null);
        response.setPayments(paymentTransactionService.getAllByBookingId(booking.getId()));

        if (booking.getExpectedReceiveDate() != null) {
            response.setExpectedReceiveDate(booking.getExpectedReceiveDate().toLocalDate());
        }
        if (booking.getExpectedReturnDate() != null) {
            response.setExpectedReturnDate(booking.getExpectedReturnDate().toLocalDate());
        }

        // Customer info
        Account account = booking.getAccount();
        if (account != null) {
            response.setCustomerName(account.getName());
            response.setCustomerEmail(account.getEmail());
            response.setCustomerPhone(account.getPhone());
        }

        return response;
    }

    private Booking findBookingOrThrow(UUID bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found: " + bookingId));
    }
    private PostTripConditionResponse toResponse(Booking booking, BookingTripCondition condition) {
        List<String> photoUrls = condition.getPhotoUrls() == null
                ? List.of()
                : condition.getPhotoUrls();

        return PostTripConditionResponse.builder()
                .bookingId(booking.getId())
                .conditionReportId(condition.getId())
                .actualReturnTimestamp(condition.getActualReturnTimestamp())
                .expectedReturnDate(booking.getExpectedReturnDate())
                .overallConditionRating(condition.getOverallConditionRating())
                .odometerReading(condition.getOdometerReading())
                .fuelLevel(condition.getFuelLevel() != null ? condition.getFuelLevel().name() : null)
                .damageNotes(condition.getDamageNotes())
                .photoUrls(photoUrls)
                .baseRentalFee(booking.getBookingPrice())
                .overdueFee(condition.getOverdueFee())
                .damageFee(condition.getDamageFee())
                .totalAmountDue(condition.getTotalAmountDue())
                .bookingStatus(booking.getStatus())
                .postTripConfirmationStatus(condition.getConfirmationStatus())
                .disputeReason(condition.getDisputeReason())
                .build();
    }

    private BigDecimal calculateDamageFee(BigDecimal rating, String damageNotes) {
        boolean hasNotes = damageNotes != null && !damageNotes.isBlank();

        // Perfect or near-perfect with no notes → free
        if (rating.compareTo(new BigDecimal("4.0")) >= 0 && !hasNotes) {
            return BigDecimal.ZERO;
        }
        // Rating < 3 → significant damage regardless of notes
        if (rating.compareTo(new BigDecimal("3.0")) < 0) {
            return DAMAGE_FEE_MAJOR;
        }
        // Rating 3–3.9, or has notes → minor damage fee
        return DAMAGE_FEE_MINOR;
    }
    private List<String> savePostTripPhotos(List<MultipartFile> photos, UUID bookingId) {
        try {
            Path dir = Paths.get(uploadDir, "post-trip", bookingId.toString());
            if (!Files.exists(dir)) {
                Files.createDirectories(dir);
            }

            return photos.stream().map(photo -> {
                try {
                    String original = photo.getOriginalFilename();
                    String ext = (original != null && original.contains("."))
                            ? original.substring(original.lastIndexOf("."))
                            : "";
                    String filename = UUID.randomUUID() + ext;

                    Files.copy(photo.getInputStream(), dir.resolve(filename),
                            StandardCopyOption.REPLACE_EXISTING);

                    return "/uploads/post-trip/" + bookingId + "/" + filename;

                } catch (IOException e) {
                    throw new RuntimeException("Failed to store post-trip photo: " + e.getMessage(), e);
                }
            }).collect(Collectors.toList());

        } catch (IOException e) {
            throw new RuntimeException("Failed to create post-trip photo directory: " + e.getMessage(), e);
        }
    }


    // STEP 1 — Staff records vehicle return timestamp
    // Transition: IN_PROGRESS → RETURNED
    // Note: overdue fee calculation stays in confirmReturn() as you have it.
    //       Here we just record the moment and create the condition report shell.
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public PostTripConditionResponse recordReturnTimestamp(UUID bookingId) {
        Booking booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException(
                    "Cannot record return: booking must be IN_PROGRESS. Current: " + booking.getStatus()
            );
        }

        if (tripConditionRepository.existsByBookingId(bookingId)) {
            throw new IllegalStateException(
                    "Return timestamp already recorded for booking: " + bookingId
            );
        }

        LocalDateTime now = LocalDateTime.now();

        // Create condition report shell — photos + fields filled in step 2
        BookingTripCondition condition = BookingTripCondition.builder()
                .booking(booking)
                .actualReturnTimestamp(now)
                .confirmationStatus(PostTripConfirmationStatus.PENDING_USER)
                .build();
        tripConditionRepository.save(condition);

        // Transition booking status
        booking.setActualReturnDate(now);
        booking.setStatus(BookingStatus.RETURNED);
        bookingRepository.save(booking);

        return toResponse(booking, condition);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flow 2- return - STEP 2 — Staff uploads post-trip photos + condition report
    // Transition: RETURNED → PENDING_USER_CONFIRMATION
    // Uses same local-storage pattern as MediaFileServiceImpl
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public PostTripConditionResponse uploadPostTripCondition(
            UUID bookingId,
            PostTripConditionRequest request,
            List<MultipartFile> photos
    ) {
        Booking booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.RETURNED) {
            throw new IllegalStateException(
                    "Cannot upload post-trip condition: return timestamp must be recorded first. Current: "
                            + booking.getStatus()
            );
        }

        BookingTripCondition condition = tripConditionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalStateException(
                        "No return timestamp recorded for booking: " + bookingId
                ));

        // Condition fields
        condition.setOverallConditionRating(request.getOverallConditionRating());
        condition.setOdometerReading(request.getOdometerReading());
        condition.setFuelLevel(FuelLevel.valueOf(request.getFuelLevel().toUpperCase()));
        condition.setDamageNotes(request.getDamageNotes());

        // Save photos using same pattern as MediaFileServiceImpl
        List<String> photoUrls = savePostTripPhotos(photos, bookingId);
        condition.setPhotoUrls(photoUrls);

        // Damage fee — overdue fee already handled by existing confirmReturn() flow
        BigDecimal damageFee = calculateDamageFee(
                request.getOverallConditionRating(),
                request.getDamageNotes()
        );
        condition.setDamageFee(damageFee);

        // Total = base booking price + any overdue already on the booking + damage
        BigDecimal overdueFee = booking.getOverdueCharge() != null
                ? booking.getOverdueCharge()
                : BigDecimal.ZERO;
        BigDecimal total = booking.getBookingPrice()
                .add(overdueFee)
                .add(damageFee);

        condition.setOverdueFee(overdueFee);
        condition.setTotalAmountDue(total);
        condition.setConfirmationStatus(PostTripConfirmationStatus.PENDING_USER);

        tripConditionRepository.save(condition);

        // Update booking remaining amount to reflect final total
        booking.setTotalPrice(total);
        booking.setRemainingAmount(total.subtract(booking.getDepositAmount()));
        booking.setStatus(BookingStatus.PENDING_USER_CONFIRMATION);
        bookingRepository.save(booking);

        return toResponse(booking, condition);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flow 2 - return - STEP 3 — User reviews condition and accepts or disputes
    // ACCEPT  → PENDING_PAYMENT (ready for PayOS QR or cash)
    // DISPUTE → DISPUTED (staff resolves manually)
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Fetches the post-trip condition report for a booking.
     * Ownership-checked — only the booking's account can view.
     * Available once staff has completed upload-post-trip-condition (status: PENDING_USER_CONFIRMATION and beyond).
     */
    @Transactional(readOnly = true)
    public PostTripConditionResponse getPostTripCondition(UUID bookingId, UUID accountId) {
        Booking booking = findBookingOrThrow(bookingId);

        if (!booking.getAccount().getId().equals(accountId)) {
            throw new IllegalStateException("You are not the owner of this booking");
        }

        BookingTripCondition condition = tripConditionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalStateException(
                        "Post-trip condition report is not yet available for this booking"
                ));

        return toResponse(booking, condition);
    }

    @Transactional
    public PostTripConditionResponse confirmPostTripCondition(
            UUID bookingId,
            UUID accountId,
            ConfirmPostTripRequest request
    ) {
        Booking booking = findBookingOrThrow(bookingId);

        // Ownership check — matches your existing pattern using Account
        if (!booking.getAccount().getId().equals(accountId)) {
            throw new IllegalStateException("You are not the owner of this booking");
        }

        if (booking.getStatus() != BookingStatus.PENDING_USER_CONFIRMATION) {
            throw new IllegalStateException(
                    "Cannot confirm: booking is not awaiting user confirmation. Current: "
                            + booking.getStatus()
            );
        }

        BookingTripCondition condition = tripConditionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalStateException(
                        "No post-trip condition report found for booking: " + bookingId
                ));

        PostTripConditionResponse response;

        if (request.getAction() == ConfirmPostTripRequest.Action.ACCEPT) {
            condition.setConfirmationStatus(PostTripConfirmationStatus.ACCEPTED);
            booking.setStatus(BookingStatus.PENDING_PAYMENT);
            tripConditionRepository.save(condition);
            bookingRepository.save(booking);

            // Create PayOS payment for remaining balance (QR path)
            // Cash path skips this — staff calls markFinalPaid() instead
            BigDecimal remaining = booking.getRemainingAmount();
            String paymentUrl = null;
            if (remaining != null && remaining.compareTo(BigDecimal.ZERO) > 0) {
                var payment = paymentTransactionService.createPayment(
                        bookingId,
                        PaymentPurpose.FINAL_PAYMENT,
                        remaining
                );
                paymentUrl = payment.getPaymentUrl();
            }

            response = toResponse(booking, condition);
            response.setPaymentUrl(paymentUrl);

        } else { // DISPUTE
            if (request.getDisputeReason() == null || request.getDisputeReason().isBlank()) {
                throw new IllegalArgumentException("disputeReason is required when action is DISPUTE");
            }
            condition.setConfirmationStatus(PostTripConfirmationStatus.DISPUTED);
            condition.setDisputeReason(request.getDisputeReason());
            booking.setStatus(BookingStatus.DISPUTED);
            tripConditionRepository.save(condition);
            bookingRepository.save(booking);

            response = toResponse(booking, condition);
        }

        return response;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Flow 2 - return - STEP 4 (cash path) — Staff confirms cash payment received
    // Transition: PENDING_PAYMENT → COMPLETED
    // Guard: user must have ACCEPTED the condition report first
    // ─────────────────────────────────────────────────────────────────────────
    @Transactional
    public PostTripConditionResponse markFinalPaid(UUID bookingId) {
        Booking booking = findBookingOrThrow(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING_PAYMENT) {
            throw new IllegalStateException(
                    "Cannot mark as paid: booking must be PENDING_PAYMENT. Current: "
                            + booking.getStatus()
            );
        }

        BookingTripCondition condition = tripConditionRepository.findByBookingId(bookingId)
                .orElseThrow(() -> new IllegalStateException(
                        "No post-trip condition report found for booking: " + bookingId
                ));

        // Extra guard — user must have explicitly accepted
        if (condition.getConfirmationStatus() != PostTripConfirmationStatus.ACCEPTED) {
            throw new IllegalStateException(
                    "Cannot mark as paid: user has not accepted the post-trip condition report"
            );
        }

        booking.setStatus(BookingStatus.COMPLETED);
        bookingRepository.save(booking);

        return toResponse(booking, condition);
    }

}
