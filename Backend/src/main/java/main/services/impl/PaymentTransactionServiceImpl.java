package main.services.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.Booking;
import main.entities.PaymentTransaction;
import main.enums.PaymentMethod;
import main.enums.BookingNotificationEventType;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import main.mappers.PaymentTransactionMapper;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.PaymentTransactionService;
import main.services.PayosService;
import main.services.BookingNotificationService;

@Service
@RequiredArgsConstructor
public class PaymentTransactionServiceImpl implements PaymentTransactionService {

    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;
    private final PayosService payosService;
    private final PaymentTransactionMapper paymentTransactionMapper;
    private final BookingNotificationService bookingNotificationService;

    @Override
    @Transactional
    public PaymentTransactionResponse createPayment(UUID bookingId, PaymentPurpose paymentPurpose, BigDecimal amount) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (paymentPurpose == PaymentPurpose.OVERDUE_PAYMENT) {
            throw new IllegalArgumentException("OVERDUE_PAYMENT is no longer created in new settlement flows. Use FINAL_PAYMENT.");
        }

        return createPayosPayment(booking, paymentPurpose, amount);
    }

        @Override
        @Transactional
        public PaymentTransactionResponse createOrGetFinalPayment(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getActualReturnDate() == null) {
            throw new IllegalStateException("Cannot create final payment before return is recorded");
        }

        BigDecimal remainingAmount = booking.getRemainingAmount() == null
            ? BigDecimal.ZERO
            : booking.getRemainingAmount();

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("No remaining amount to settle");
        }

        return paymentTransactionRepository
            .findFirstByBooking_IdAndPurposeAndStatusOrderByCreatedAtDesc(
                bookingId,
                PaymentPurpose.FINAL_PAYMENT,
                PaymentStatus.PENDING
            )
            .map(paymentTransactionMapper::toPaymentTransactionResponse)
            .orElseGet(() -> createPayosPayment(booking, PaymentPurpose.FINAL_PAYMENT, remainingAmount));
        }

        @Override
        @Transactional
        public PaymentTransactionResponse settleFinalPaymentByCash(UUID bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
            .orElseThrow(() -> new RuntimeException("Booking not found"));

        if (booking.getActualReturnDate() == null) {
            throw new IllegalStateException("Cannot settle final payment before return is recorded");
        }

        BigDecimal remainingAmount = booking.getRemainingAmount() == null
            ? BigDecimal.ZERO
            : booking.getRemainingAmount();

        if (remainingAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalStateException("No remaining amount to settle");
        }

        paymentTransactionRepository
            .findFirstByBooking_IdAndPurposeAndStatusOrderByCreatedAtDesc(
                bookingId,
                PaymentPurpose.FINAL_PAYMENT,
                PaymentStatus.PENDING
            )
            .ifPresent(tx -> {
                tx.setStatus(PaymentStatus.CANCELLED);
                paymentTransactionRepository.save(tx);
            });

        PaymentTransaction cashTransaction = PaymentTransaction.builder()
            .booking(booking)
            .purpose(PaymentPurpose.FINAL_PAYMENT)
            .paymentMethod(PaymentMethod.CASH)
            .amount(remainingAmount)
            .payOSPaymentCode(generatePayOSOrderCode())
            .status(PaymentStatus.PAID)
            .paymentUrl(null)
            .build();
        paymentTransactionRepository.save(cashTransaction);

        booking.setRemainingAmount(BigDecimal.ZERO);
        booking.setStatus(main.enums.BookingStatus.COMPLETED);
        bookingRepository.save(booking);
        bookingNotificationService.sendNotification(booking, BookingNotificationEventType.BOOKING_COMPLETED);

        return paymentTransactionMapper.toPaymentTransactionResponse(cashTransaction);
        }

        private PaymentTransactionResponse createPayosPayment(Booking booking, PaymentPurpose paymentPurpose, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero");
        }

        long payOSOrderCode = generatePayOSOrderCode();

        PaymentTransaction transaction = PaymentTransaction.builder()
            .booking(booking)
            .purpose(paymentPurpose)
            .paymentMethod(PaymentMethod.PAYOS)
            .amount(amount)
            .payOSPaymentCode(payOSOrderCode)
            .status(PaymentStatus.PENDING)
            .build();

        String paymentLink = payosService.createPaymentLink(
            payOSOrderCode,
            amount,
            booking.getId(),
            paymentPurpose
        );

        transaction.setPaymentUrl(paymentLink);
        paymentTransactionRepository.save(transaction);
        return paymentTransactionMapper.toPaymentTransactionResponse(transaction);
        }

        private long generatePayOSOrderCode() {
        return (System.currentTimeMillis() * 1000L) + (System.nanoTime() % 1000L);
        }



    @Override
    public PaymentTransactionResponse getById(UUID paymentTransactionId) {
        PaymentTransaction transaction = paymentTransactionRepository.findById(paymentTransactionId)
                .orElseThrow(() -> new RuntimeException("Payment transaction not found"));

        PaymentTransactionResponse response = paymentTransactionMapper.toPaymentTransactionResponse(transaction);

        // Use stored payment URL if status is PENDING
        if (transaction.getStatus() == PaymentStatus.PENDING && transaction.getPaymentUrl() != null) {
            response.setPaymentUrl(transaction.getPaymentUrl());
        }
        
        return response;
    }

    @Override
    public PaymentTransactionResponse getLatestByBookingId(UUID bookingId) {
        PaymentTransaction transaction = paymentTransactionRepository
                .findFirstByBooking_IdOrderByCreatedAtDesc(bookingId)
                .orElseThrow(() -> new RuntimeException("No payment transaction found for booking"));

        PaymentTransactionResponse response = paymentTransactionMapper.toPaymentTransactionResponse(transaction);

        // Use stored payment URL if status is PENDING
        if (transaction.getStatus() == PaymentStatus.PENDING && transaction.getPaymentUrl() != null) {
            response.setPaymentUrl(transaction.getPaymentUrl());
        }
        
        return response;
    }

    @Override
    public List<PaymentTransactionResponse> getAllByBookingId(UUID bookingId) {

//        return paymentTransactionRepository.findByBooking_Id(bookingId)
//                .stream()
//                .map(tx -> PaymentTransactionResponse.builder()
//                        .id(tx.getId())
//                        .bookingId(bookingId)
//                        .amount(tx.getAmount())
//                        .payOSPaymentCode(tx.getPayOSPaymentCode())
//                        .status(tx.getStatus())
//                        .purpose(tx.getPurpose())
//                        .createdAt(tx.getCreatedAt())
//                        .lastUpdatedAt(tx.getLastUpdatedAt())
//                        .build()
//                )
//                .toList();

        return paymentTransactionMapper.toListPaymentTransactionResponse(paymentTransactionRepository.findByBooking_Id(bookingId));
    }

}
