package main.controllers;

import lombok.RequiredArgsConstructor;
import main.dtos.response.PaymentTransactionResponse;
import main.services.PaymentTransactionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentTransactionController {

    private final PaymentTransactionService paymentTransactionService;

    /**
     * Get payment transaction by ID
     * GET /api/payments/{paymentId}
     */
    @GetMapping("/{paymentId}")
    public ResponseEntity<PaymentTransactionResponse> getPaymentById(
            @PathVariable UUID paymentId
    ) {
        PaymentTransactionResponse response = paymentTransactionService.getById(paymentId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get latest payment for a booking
     * GET /api/payments/booking/{bookingId}/latest
     */
    @GetMapping("/booking/{bookingId}/latest")
    public ResponseEntity<PaymentTransactionResponse> getLatestPaymentByBookingId(
            @PathVariable UUID bookingId
    ) {
        PaymentTransactionResponse response = paymentTransactionService.getLatestByBookingId(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Get all payments for a booking
     * GET /api/payments/booking/{bookingId}
     */
    @GetMapping("/booking/{bookingId}")
    public ResponseEntity<List<PaymentTransactionResponse>> getAllPaymentsByBookingId(
            @PathVariable UUID bookingId
    ) {
        List<PaymentTransactionResponse> response = paymentTransactionService.getAllByBookingId(bookingId);
        return ResponseEntity.ok(response);
    }

}
