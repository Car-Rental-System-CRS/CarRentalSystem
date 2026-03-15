package main.services.impl;

import java.math.BigDecimal;
import java.time.Duration;      
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
import main.dtos.request.StaffPostTripInspectionItemRequest;
import main.dtos.request.StaffPostTripInspectionRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
import main.dtos.response.CarResponse;
import main.dtos.response.MediaFileResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.dtos.response.PostTripInspectionItemResponse;
import main.dtos.response.PostTripInspectionResponse;
import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.Car;
import main.entities.MediaFile;
import main.entities.PostTripInspection;
import main.entities.PostTripInspectionItem;
import main.enums.BookingStatus;
import main.enums.DamageSource;
import main.enums.MediaCategory;
import main.enums.PaymentPurpose;
import main.mappers.BookingMapper;
import main.mappers.CarMapper;
import main.mappers.MediaFileMapper;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.repositories.MediaFileRepository;
import main.repositories.PostTripInspectionRepository;
import main.services.BookingService;
import main.services.MediaFileService;
import main.services.PaymentTransactionService;

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
    private final PostTripInspectionRepository postTripInspectionRepository;
    private final MediaFileRepository mediaFileRepository;
    private final MediaFileService mediaFileService;


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
        
        // Validate car type exists
        if (!carTypeRepository.existsById(request.getCarTypeId())) {
            throw new IllegalArgumentException("Car type not found: " + request.getCarTypeId());
        }

        List<UUID> selectedCarIds = resolveSelectedCarIds(request, pickup, returnDt);

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
        List<CarResponse> carResponses = cars.stream()
            .map(CarMapper::toResponseWithDamageImages)
            .toList();

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

    private List<UUID> resolveSelectedCarIds(CreateBookingRequest request, LocalDateTime pickup, LocalDateTime returnDt) {
        List<UUID> requestedSelectedIds = request.getSelectedCarIds();

        if (requestedSelectedIds != null && !requestedSelectedIds.isEmpty()) {
            Set<UUID> uniqueIds = new LinkedHashSet<>(requestedSelectedIds);
            List<UUID> selectedIds = List.copyOf(uniqueIds);

            List<Car> selectedCars = carRepository.findAllById(selectedIds);
            if (selectedCars.size() != selectedIds.size()) {
                throw new IllegalArgumentException("One or more selected cars were not found");
            }

            boolean hasDifferentType = selectedCars.stream()
                    .anyMatch(car -> car.getCarType() == null || !request.getCarTypeId().equals(car.getCarType().getId()));
            if (hasDifferentType) {
                throw new IllegalArgumentException("All selected cars must belong to the requested car type");
            }

            List<UUID> availableCarIds = findAvailableCarIds(request.getCarTypeId(), pickup, returnDt);
            boolean hasUnavailableSelection = selectedIds.stream().anyMatch(id -> !availableCarIds.contains(id));
            if (hasUnavailableSelection) {
                throw new IllegalArgumentException("One or more selected cars are no longer available. Please re-select cars.");
            }

            return selectedIds;
        }

        if (request.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0 when selectedCarIds is empty");
        }

        List<UUID> availableCarIds = findAvailableCarIds(request.getCarTypeId(), pickup, returnDt);

        if (availableCarIds.size() < request.getQuantity()) {
            throw new IllegalArgumentException("Not enough cars available. Only " + availableCarIds.size() + " available.");
        }

        return availableCarIds.subList(0, request.getQuantity());
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
        response.setCars(cars.stream().map(CarMapper::toResponseWithDamageImages).toList());
        
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
                    response.setCars(cars.stream().map(CarMapper::toResponseWithDamageImages).toList());
                    
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
        AdminBookingResponse response = toAdminBookingResponse(booking);

        if (booking.getStatus() == BookingStatus.COMPLETED
            || Boolean.TRUE.equals(booking.getPostTripInspectionCompleted())) {
            List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(bookingId);
            List<Car> cars = bookingCars.stream()
                    .map(BookingCar::getCar)
                    .toList();
            response.setCars(cars.stream().map(CarMapper::toResponseWithDamageImages).toList());
        }

        return response;
    }

    @Override
    @Transactional
    public AdminBookingResponse confirmPickup(UUID bookingId, String pickupNotes) {
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
        if (pickupNotes != null && !pickupNotes.isBlank()) {
            booking.setPickupNotes(pickupNotes.trim());
        }
        booking.setStatus(BookingStatus.IN_PROGRESS);
        bookingRepository.save(booking);

        return toAdminBookingResponse(booking);
    }

    @Override
    @Transactional
    public AdminBookingResponse confirmReturn(UUID bookingId, String returnNotes) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Booking must be in IN_PROGRESS status to confirm return. Current: " + booking.getStatus());
        }

        LocalDateTime now = LocalDateTime.now();
        booking.setActualReturnDate(now);
        booking.setPostTripInspectionCompleted(false);
        booking.setPostTripInspectionAt(null);
        if (returnNotes != null && !returnNotes.isBlank()) {
            booking.setReturnNotes(returnNotes.trim());
        }

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
            booking.setStatus(BookingStatus.IN_PROGRESS);
            bookingRepository.save(booking);
        } else {
            booking.setStatus(BookingStatus.IN_PROGRESS);
            bookingRepository.save(booking);
        }

        return toAdminBookingResponse(booking);
    }

    @Override
    @Transactional
    public PaymentTransactionResponse createFinalPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Booking must be IN_PROGRESS to create final payment. Current: " + booking.getStatus());
        }

        ensurePostTripInspectionCompleted(booking);

        return paymentTransactionService.createOrGetFinalPayment(bookingId);
    }

    @Override
    @Transactional
    public PaymentTransactionResponse settleFinalPaymentByCash(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getStatus() != BookingStatus.IN_PROGRESS) {
            throw new IllegalStateException("Booking must be IN_PROGRESS to settle final payment. Current: " + booking.getStatus());
        }

        ensurePostTripInspectionCompleted(booking);

        return paymentTransactionService.settleFinalPaymentByCash(bookingId);
    }

    @Override
    @Transactional
    public List<MediaFileResponse> uploadPostTripDamageImages(UUID bookingId, UUID carId, MultipartFile[] images, String[] imageDescriptions) {
        if (images == null || images.length == 0) {
            throw new IllegalArgumentException("No images provided");
        }

        if (images.length > 10) {
            throw new IllegalArgumentException("Maximum 10 damage images are allowed per request");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ensurePostTripInspectionEditable(booking);

        boolean carBelongsToBooking = bookingCarRepository.findByBookingId(bookingId).stream()
                .map(bookingCar -> bookingCar.getCar().getId())
                .anyMatch(carId::equals);
        if (!carBelongsToBooking) {
            throw new IllegalArgumentException("Car " + carId + " does not belong to booking " + bookingId);
        }

        List<MediaFile> existingMedia = mediaFileService.getCarDamageMediaFiles(carId);
        int startOrder = existingMedia.isEmpty() ? 0 : existingMedia.size();

        List<MediaFile> uploadedFiles = new ArrayList<>();
        for (int i = 0; i < images.length; i++) {
            String description = (imageDescriptions != null && i < imageDescriptions.length)
                    ? imageDescriptions[i]
                    : null;

            MediaFile uploaded = mediaFileService.uploadPostTripDamageMediaFile(
                    carId,
                    bookingId,
                    images[i],
                    description,
                    startOrder + i
            );
            uploadedFiles.add(uploaded);
        }

        return uploadedFiles.stream()
                .map(MediaFileMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public PostTripInspectionResponse upsertPostTripInspection(UUID bookingId, StaffPostTripInspectionRequest request, UUID inspectorAccountId) {
        if (request == null) {
            throw new IllegalArgumentException("Inspection payload is required");
        }

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        ensurePostTripInspectionEditable(booking);

        List<BookingCar> bookingCars = bookingCarRepository.findByBookingId(bookingId);
        Map<UUID, Car> bookedCarsById = bookingCars.stream()
                .map(BookingCar::getCar)
                .collect(Collectors.toMap(Car::getId, Function.identity(), (left, right) -> left));

        boolean noAdditionalDamage = request.isNoAdditionalDamage();
        List<StaffPostTripInspectionItemRequest> requestedItems = request.getItems() == null
                ? Collections.emptyList()
                : request.getItems();

        if (noAdditionalDamage) {
            boolean hasDamageInPayload = requestedItems.stream().anyMatch(StaffPostTripInspectionItemRequest::isHasNewDamage);
            if (hasDamageInPayload) {
                throw new IllegalArgumentException("No-damage inspection cannot include damaged items");
            }
        } else {
            if (requestedItems.isEmpty()) {
                throw new IllegalArgumentException("At least one car inspection item is required when additional damage is reported");
            }
            boolean hasDamage = requestedItems.stream().anyMatch(StaffPostTripInspectionItemRequest::isHasNewDamage);
            if (!hasDamage) {
                throw new IllegalArgumentException("At least one item must be marked with new damage");
            }
        }

        PostTripInspection inspection = postTripInspectionRepository.findByBookingId(bookingId)
                .orElseGet(() -> PostTripInspection.builder().booking(booking).build());

        LocalDateTime now = LocalDateTime.now();
        Account inspector = inspectorAccountId == null
            ? null
            : accountRepository.findById(inspectorAccountId).orElse(null);

        inspection.setInspectedAt(now);
        inspection.setInspectedBy(inspector);
        inspection.setSummaryNotes(request.getSummaryNotes() != null ? request.getSummaryNotes().trim() : null);
        inspection.setNoAdditionalDamage(noAdditionalDamage);
        inspection.setCompleted(true);

        inspection.getItems().clear();
        for (StaffPostTripInspectionItemRequest itemRequest : requestedItems) {
            if (itemRequest.getCarId() == null) {
                throw new IllegalArgumentException("Each inspection item must include carId");
            }
            Car car = bookedCarsById.get(itemRequest.getCarId());
            if (car == null) {
                throw new IllegalArgumentException("Car " + itemRequest.getCarId() + " does not belong to the booking");
            }

            List<MediaFile> linkedDamageImages = resolveLinkedDamageMediaFiles(itemRequest, car);
            if (itemRequest.isHasNewDamage() && linkedDamageImages.isEmpty()) {
                throw new IllegalArgumentException("Damaged item must include at least one linked damage image for car " + car.getId());
            }
            if (!itemRequest.isHasNewDamage() && !linkedDamageImages.isEmpty()) {
                throw new IllegalArgumentException("Cannot attach damage images to an item marked without new damage");
            }

            int uploadedCount = linkedDamageImages.isEmpty()
                    ? (itemRequest.getUploadedDamageImageCount() == null
                        ? 0
                        : Math.max(itemRequest.getUploadedDamageImageCount(), 0))
                    : linkedDamageImages.size();

            PostTripInspectionItem item = PostTripInspectionItem.builder()
                    .inspection(inspection)
                    .car(car)
                    .notes(itemRequest.getNotes() != null ? itemRequest.getNotes().trim() : null)
                    .hasNewDamage(itemRequest.isHasNewDamage())
                    .uploadedDamageImageCount(uploadedCount)
                    .build();
            item.getDamageImages().addAll(linkedDamageImages);
            inspection.getItems().add(item);
        }

        PostTripInspection savedInspection = postTripInspectionRepository.save(inspection);

        booking.setPostTripInspectionCompleted(true);
        booking.setPostTripInspectionAt(now);

        BigDecimal remainingAmount = booking.getRemainingAmount() == null ? BigDecimal.ZERO : booking.getRemainingAmount();
        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            booking.setStatus(BookingStatus.COMPLETED);
        }

        bookingRepository.save(booking);

        Set<UUID> retainedPostTripMediaIds = savedInspection.getItems().stream()
                .flatMap(item -> item.getDamageImages().stream())
                .filter(mediaFile -> mediaFile.getDamageSource() == DamageSource.POST_TRIP_INSPECTION)
                .filter(mediaFile -> Objects.equals(mediaFile.getSourceBookingId(), bookingId))
                .map(MediaFile::getId)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        mediaFileService.deletePostTripDamageMediaFilesNotIn(bookingId, List.copyOf(retainedPostTripMediaIds));

        return toPostTripInspectionResponse(savedInspection);
    }

    @Override
    @Transactional(readOnly = true)
    public PostTripInspectionResponse getPostTripInspection(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        return postTripInspectionRepository.findByBookingId(bookingId)
                .map(this::toPostTripInspectionResponse)
                .orElseGet(() -> {
                    PostTripInspectionResponse empty = new PostTripInspectionResponse();
                    empty.setBookingId(booking.getId());
                    empty.setCompleted(Boolean.TRUE.equals(booking.getPostTripInspectionCompleted()));
                    empty.setInspectedAt(booking.getPostTripInspectionAt());
                    empty.setNoAdditionalDamage(false);
                    empty.setItems(List.of());
                    return empty;
                });
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
        response.setPickupNotes(booking.getPickupNotes());
        response.setReturnNotes(booking.getReturnNotes());
        response.setPostTripInspectionAt(booking.getPostTripInspectionAt());
        response.setPostTripInspectionCompleted(Boolean.TRUE.equals(booking.getPostTripInspectionCompleted()));
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

    private void ensurePostTripInspectionCompleted(Booking booking) {
        if (!Boolean.TRUE.equals(booking.getPostTripInspectionCompleted())) {
            throw new IllegalStateException("Post-trip inspection must be completed before settlement");
        }
    }

    private void ensurePostTripInspectionEditable(Booking booking) {
        if (booking.getStatus() != BookingStatus.IN_PROGRESS || booking.getActualReturnDate() == null) {
            throw new IllegalStateException("Post-trip inspection is only available after return is confirmed");
        }
    }

    private PostTripInspectionResponse toPostTripInspectionResponse(PostTripInspection inspection) {
        PostTripInspectionResponse response = new PostTripInspectionResponse();
        response.setId(inspection.getId());
        response.setBookingId(inspection.getBooking().getId());
        response.setCompleted(inspection.isCompleted());
        response.setNoAdditionalDamage(inspection.isNoAdditionalDamage());
        response.setSummaryNotes(inspection.getSummaryNotes());
        response.setInspectedAt(inspection.getInspectedAt());
        response.setInspectedByAccountId(inspection.getInspectedBy() != null ? inspection.getInspectedBy().getId() : null);

        List<PostTripInspectionItemResponse> items = inspection.getItems().stream()
                .map(item -> {
                    PostTripInspectionItemResponse itemResponse = new PostTripInspectionItemResponse();
                    itemResponse.setCarId(item.getCar().getId());
                    itemResponse.setLicensePlate(item.getCar().getLicensePlate());
                    itemResponse.setHasNewDamage(item.isHasNewDamage());
                    itemResponse.setUploadedDamageImageCount(item.getUploadedDamageImageCount());
                    itemResponse.setNotes(item.getNotes());
                    itemResponse.setDamageImages(item.getDamageImages() == null
                            ? List.of()
                            : item.getDamageImages().stream()
                                    .map(MediaFileMapper::toResponse)
                                    .toList());
                    return itemResponse;
                })
                .toList();
        response.setItems(items);

        return response;
    }

    private List<MediaFile> resolveLinkedDamageMediaFiles(StaffPostTripInspectionItemRequest itemRequest, Car car) {
        List<UUID> requestedImageIds = itemRequest.getDamageImageIds() == null
                ? Collections.emptyList()
                : itemRequest.getDamageImageIds().stream()
                        .filter(id -> id != null)
                        .toList();

        if (requestedImageIds.isEmpty()) {
            return List.of();
        }

        List<UUID> deduplicatedImageIds = List.copyOf(new LinkedHashSet<>(requestedImageIds));
        List<MediaFile> mediaFiles = mediaFileRepository.findAllById(deduplicatedImageIds);
        if (mediaFiles.size() != deduplicatedImageIds.size()) {
            throw new IllegalArgumentException("One or more damage image IDs were not found for car " + car.getId());
        }

        Map<UUID, MediaFile> mediaById = mediaFiles.stream()
                .collect(Collectors.toMap(MediaFile::getId, Function.identity()));

        List<MediaFile> orderedLinkedFiles = new ArrayList<>();
        for (UUID mediaFileId : deduplicatedImageIds) {
            MediaFile mediaFile = mediaById.get(mediaFileId);
            if (mediaFile == null) {
                throw new IllegalArgumentException("Damage image " + mediaFileId + " was not found");
            }

            if (mediaFile.getCar() == null || !car.getId().equals(mediaFile.getCar().getId())) {
                throw new IllegalArgumentException("Damage image " + mediaFileId + " does not belong to car " + car.getId());
            }

            if (mediaFile.getMediaCategory() != MediaCategory.CAR_DAMAGE_IMAGE) {
                throw new IllegalArgumentException("Media file " + mediaFileId + " is not a car damage image");
            }

            orderedLinkedFiles.add(mediaFile);
        }

        return orderedLinkedFiles;
    }
}
