package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
import main.dtos.response.BookingResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.Booking;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.mappers.BookingMapper;
import main.mappers.PaymentTransactionMapper;
import main.repositories.BookingRepository;
import main.services.BookingService;
import main.services.PaymentTransactionService;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final PaymentTransactionService paymentTransactionService;
    private final BookingRepository bookingRepository;
    private final BookingMapper bookingMapper;
    private final PaymentTransactionMapper paymentTransactionMapper;

    @Override
    public BookingResponse createBooking(CreateBookingRequest request) {

        // TODO: get Account from session/JWT (do NOT take from request)
        // Account account = authContext.getCurrentAccount();

        // TODO: validate carIds (existence, availability)
        // TODO: calculate prices
        long depositPrice = calculateDepositPrice();
        long bookingPrice = calculateBookingPrice();
        long rentalPrice = calculateRentalPrice();
        long totalPrice = depositPrice + bookingPrice;
        //TODO: verify dates
        LocalDate expectedReceiveDate = request.getExpectedReceiveDate();
        LocalDate expectedReturnDate = request.getExpectedReturnDate();

        // TODO: persist Booking entity
        // TODO: map entity -> BookingResponse

        Booking booking =  Booking.builder()
                //...
                .depositPrice(depositPrice)
                .bookingPrice(bookingPrice)
                .rentalPrice(rentalPrice)
                .totalPrice(totalPrice)
                .expectedReceiveDate(expectedReceiveDate)
                .expectedReturnDate(expectedReturnDate)
                .status(BookingStatus.CREATED)
                .build();

        bookingRepository.save(booking);

        // ✅ Create booking payment
        PaymentTransactionResponse payment =
                paymentTransactionService.createPayment(
                        booking.getId(),
                        PaymentPurpose.BOOKING_PAYMENT,
                        bookingPrice
                );

        //return booking response
        BookingResponse response = bookingMapper.toBookingResponseDto(booking);
        response.setPayments(List.of(payment));
        return response;
    }

    private long calculateDepositPrice() {
        // TODO: calculate deposit price from cars + date range
        return 1000; // fixed price for testing
    }
    private long calculateTotalPrice() {
        // TODO: calculate deposit price from cars + date range
        return 10000; // fixed price for testing
    }
    private long calculateRentalPrice() {
        // TODO: calculate deposit price from cars + date range
        return 8000; // fixed price for testing
    }
    private long calculateBookingPrice() {
        // TODO: calculate deposit price from cars + date range
        return 5000; // fixed price for testing
    }


    @Override
    public BookingResponse getBookingById(UUID bookingId) {

        // TODO: fetch booking by id
        Booking booking = bookingRepository.findById(bookingId).orElse(null);

        BookingResponse response = bookingMapper.toBookingResponseDto(booking);
        response.setPayments(paymentTransactionService.getAllByBookingId(bookingId));
        return response;

        // TODO: verify ownership (current user)
        // TODO: map to BookingResponse
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
