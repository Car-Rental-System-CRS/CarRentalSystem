package main.services;

import main.dtos.response.PaymentTransactionResponse;
import main.enums.PaymentPurpose;

import java.util.List;
import java.util.UUID;

public interface PaymentTransactionService {

    // Create a PayOS payment for a booking
    PaymentTransactionResponse createPayment(UUID bookingId, PaymentPurpose paymentPurpose, Long amount);

    // Get payment transaction by id
    PaymentTransactionResponse getById(UUID paymentTransactionId);

    // Get latest payment for a booking (common case)
    PaymentTransactionResponse getLatestByBookingId(UUID bookingId);

    // get all
    List<PaymentTransactionResponse> getAllByBookingId(UUID bookingId);
}
