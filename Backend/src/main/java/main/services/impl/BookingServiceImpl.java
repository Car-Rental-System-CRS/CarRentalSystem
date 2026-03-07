package main.services.impl;

import java.math.BigDecimal;
import java.time.Duration;      
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
import main.dtos.response.CarResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.Account;
import main.entities.Booking;
import main.entities.BookingCar;
import main.entities.Car;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.mappers.BookingMapper;
import main.mappers.CarMapper;
import main.repositories.AccountRepository;
import main.repositories.BookingCarRepository;
import main.repositories.BookingRepository;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.services.BookingService;
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
}
