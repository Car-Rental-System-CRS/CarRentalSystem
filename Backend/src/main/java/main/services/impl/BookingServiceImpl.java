package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.CreateBookingResponse;
import main.entities.Booking;
import main.entities.PaymentStatus;
import main.repositories.BookingRepository;
import main.services.BookingService;
import main.services.payos.PayosService;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final PayosService payosService;

    @Override
    public CreateBookingResponse createBooking(Long amount) {
        // 1. Generate PayOS paymentCode
        long payosPaymentCode = System.currentTimeMillis();

        // 2. Create local booking
        Booking booking = Booking.builder()
                .payosPaymentCode(payosPaymentCode)
                .amount(amount)
                .status(PaymentStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        // 3. Create PayOS payment link
        String checkoutUrl =
                payosService.createPaymentLink(payosPaymentCode, amount);

        // 4. Return response
        return new CreateBookingResponse(
                booking.getId(),
                booking.getAmount(),
                booking.getStatus().name(),
                checkoutUrl
        );
    }

    @Override
    public void markPaid(Long paymentCode) {
        Booking booking = bookingRepository.findBookingByPayosPaymentCode(paymentCode)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);
    }
}
