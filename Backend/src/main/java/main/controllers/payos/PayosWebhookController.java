package main.controllers.payos;

import lombok.RequiredArgsConstructor;
import main.dtos.request.PayosWebhookRequest;
import main.entities.Booking;
import main.entities.PaymentStatus;
import main.repositories.BookingRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payos")
@RequiredArgsConstructor
public class PayosWebhookController {

    private final BookingRepository bookingRepository;

    @PostMapping("/webhook")
    public String handleWebhook(@RequestBody PayosWebhookRequest request) {

        // PayOS success code = "00"
        if (!"00".equals(request.getCode())) {
            return "IGNORED";
        }

        Long paymentCode = request.getData().getPaymentCode();
        String status = request.getData().getStatus();

        Booking booking = bookingRepository.findBookingByPayosPaymentCode(paymentCode)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        switch (status) {
            case "PAID" -> booking.setStatus(PaymentStatus.PAID);
            case "CANCELLED" -> booking.setStatus(PaymentStatus.CANCELLED);
            default -> booking.setStatus(PaymentStatus.EXPIRED);
        }

        bookingRepository.save(booking);

        return "OK";
    }
}
