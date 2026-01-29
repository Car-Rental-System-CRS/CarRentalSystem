package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.CreateOrderResponse;
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
    public CreateOrderResponse createBooking(Long amount) {
        // 1. Generate PayOS orderCode
        long payosOrderCode = System.currentTimeMillis();

        // 2. Create local order
        Booking booking = Booking.builder()
                .payosPaymentCode(payosOrderCode)
                .amount(amount)
                .status(PaymentStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        bookingRepository.save(booking);

        // 3. Create PayOS payment link
        String checkoutUrl =
                payosService.createPaymentLink(payosOrderCode, amount);

        // 4. Return response
        return new CreateOrderResponse(
                booking.getId(),
                booking.getAmount(),
                booking.getStatus().name(),
                checkoutUrl
        );
    }

    @Override
    public void markPaid(Long orderCode) {
        Booking booking = bookingRepository.findBookingByPayosPaymentCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        booking.setStatus(PaymentStatus.PAID);
        bookingRepository.save(booking);
    }
}
