package main.services.impl;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
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
    private final AccountRepository accountRepository;


    //===DEFINE BUSINESS RULES:====
    private final BigDecimal DPB = BigDecimal.valueOf(2000) ; //default price added per booking
    private final int IDAER = 1; //invalid days after each rental
    private final List<BookingStatus> blockingStatuses = List.of(
            BookingStatus.CREATED,
            BookingStatus.CONFIRMED,
            BookingStatus.IN_PROGRESS
    );
    //=============================

    @Override
    public BookingResponse createBooking(CreateBookingRequest request, UUID accountId) {

        // TODO: get Account from session/JWT (do NOT take from request)
        // Account account = authContext.getCurrentAccount();

        // Validate dates
        LocalDate expectedReceiveDate = request.getExpectedReceiveDate();
        LocalDate expectedReturnDate = request.getExpectedReturnDate();
        if (!(expectedReceiveDate.isBefore(expectedReturnDate) || expectedReceiveDate.isEqual(expectedReturnDate))) {
            throw new UnsupportedOperationException("Return day must be after receive date!");
        }

        // validate carIds (existence, availability)

        List<UUID> unavailableCarIds =
                bookingCarRepository.findUnavailableCarIds(
                        request.getCarIds(),
                        request.getExpectedReceiveDate().minusDays(IDAER+1),
                        request.getExpectedReturnDate().plusDays(IDAER+1),
                        blockingStatuses
                );

        if (!unavailableCarIds.isEmpty()) {
            System.out.println("Unavailable car ids: " + unavailableCarIds);
            System.out.println("Receive date: " + request.getExpectedReceiveDate().minusDays(IDAER+1));
            System.out.println("Return date: " + request.getExpectedReturnDate().plusDays(IDAER+1));
            throw new UnsupportedOperationException("Car IDs not available!");
        }

        Account account = accountRepository.findById(accountId).orElseThrow();

        // Saves
        Booking booking =  Booking.builder()
                //...
                .account(account)
                .expectedReceiveDate(expectedReceiveDate)
                .expectedReturnDate(expectedReturnDate)
                .status(BookingStatus.CREATED)
                .build();
            

        Booking finalbooking = bookingRepository.save(booking);

        //assign cars to this booking

        List<Car> cars = carRepository.findAllById(request.getCarIds());
        List<BookingCar> bookingCars = cars.stream()
                .map(car -> BookingCar.builder()
                        .booking(finalbooking)
                        .car(car)
                        .build())
                .toList();
        List<CarResponse> carResponses = CarMapper.toResponseList(cars);

        bookingCarRepository.saveAll(bookingCars);


        // TODO: calculate prices
        BigDecimal bookingPrice = calculateBookingPrice(cars,expectedReceiveDate,expectedReturnDate);
        finalbooking.setBookingPrice(bookingPrice);

        PaymentTransactionResponse payment =
                paymentTransactionService.createPayment(
                        finalbooking.getId(),
                        PaymentPurpose.BOOKING_PAYMENT,
                        bookingPrice
                );

        //return booking response
        BookingResponse response = bookingMapper.toBookingResponseDto(finalbooking);
        response.setPayments(List.of(payment));
        response.setCars(carResponses);
        return response;
    }

    private BigDecimal calculateBookingPrice(List<Car> cars, LocalDate expectedReceiveDate, LocalDate expectedReturnDate) {
        // TODO: calculate deposit price from cars + date range
        BigDecimal totalCarPrice = BigDecimal.ZERO;
        for (Car car : cars) {
            totalCarPrice = totalCarPrice.add(car.getCarType().getPrice());
        }
        long days = ChronoUnit.DAYS.between(expectedReceiveDate, expectedReturnDate);
        days = Math.max(days, 1); // optional business rule

        totalCarPrice = totalCarPrice.multiply(BigDecimal.valueOf(days));
        return totalCarPrice.add(DPB); // fixed price for testing
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

        // TODO: verify ownership (current user)
    }

    @Override
    public List<BookingResponse> getMyBookings() {

        // TODO: get Account from session/JWT
        // TODO: fetch bookings by account
        // TODO: map to responses

        throw new UnsupportedOperationException("Not implemented yet");
    }

    @Override
    public void cancelBooking(UUID bookingId) {

        // TODO: fetch booking
        // TODO: validate cancellation rules
        // TODO: update status to CANCELED
        // TODO: handle payment cancel/refund if needed

        throw new UnsupportedOperationException("Not implemented yet");
    }
}
