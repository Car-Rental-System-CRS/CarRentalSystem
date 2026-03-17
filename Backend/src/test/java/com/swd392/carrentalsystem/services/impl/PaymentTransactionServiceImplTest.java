package com.swd392.carrentalsystem.services.impl;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;

import main.dtos.response.PaymentTransactionResponse;
import main.entities.Booking;
import main.entities.PaymentTransaction;
import main.enums.BookingNotificationEventType;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import main.mappers.PaymentTransactionMapper;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.BookingNotificationService;
import main.services.PayosService;
import main.services.impl.PaymentTransactionServiceImpl;

@ExtendWith(MockitoExtension.class)
class PaymentTransactionServiceImplTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private PaymentTransactionRepository paymentTransactionRepository;

    @Mock
    private PayosService payosService;

    @Mock
    private PaymentTransactionMapper paymentTransactionMapper;

    @Mock
    private BookingNotificationService bookingNotificationService;

    @InjectMocks
    private PaymentTransactionServiceImpl paymentTransactionService;

    @Test
    void createPayment_ShouldCreatePendingTransactionAndReturnPaymentUrl() {

        // Arrange
        UUID bookingId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(1_000_000);
        PaymentPurpose purpose = PaymentPurpose.BOOKING_PAYMENT;

        Booking booking = new Booking();
        booking.setId(bookingId);

        PaymentTransaction transaction = PaymentTransaction.builder()
                .booking(booking)
                .amount(amount)
                .purpose(purpose)
                .status(PaymentStatus.PENDING)
                .build();

        PaymentTransactionResponse response =
                new PaymentTransactionResponse();

        String paymentUrl = "https://payos.test/checkout";
        response.setPaymentUrl(paymentUrl);

        when(bookingRepository.findById(bookingId))
                .thenReturn(Optional.of(booking));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenReturn(transaction);

        when(payosService.createPaymentLink(anyLong(), eq(amount), eq(bookingId), eq(purpose)))
                .thenReturn(paymentUrl);

        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(response);

        // Act
        PaymentTransactionResponse result =
                paymentTransactionService.createPayment(
                        bookingId,
                        purpose,
                        amount
                );

        // Assert
        assertNotNull(result);
        assertEquals(paymentUrl, result.getPaymentUrl());

        verify(bookingRepository).findById(bookingId);
        verify(paymentTransactionRepository).save(any(PaymentTransaction.class));
        verify(payosService).createPaymentLink(anyLong(), eq(amount), eq(bookingId), eq(purpose));
    }

    @Test
    void createPayment_ShouldRejectOverduePurposeForNewFlow() {
        UUID bookingId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(500_000);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(new Booking()));

        IllegalArgumentException ex = assertThrows(
                IllegalArgumentException.class,
                () -> paymentTransactionService.createPayment(bookingId, PaymentPurpose.OVERDUE_PAYMENT, amount)
        );

        assertTrue(ex.getMessage().contains("OVERDUE_PAYMENT is no longer created"));
        verify(paymentTransactionRepository, never()).save(any(PaymentTransaction.class));
        verifyNoInteractions(payosService);
    }

    @Test
    void settleFinalPaymentByCash_ShouldCompleteBookingAndSendNotification() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setActualReturnDate(java.time.LocalDateTime.now());
        booking.setRemainingAmount(BigDecimal.valueOf(250_000));
        booking.setStatus(BookingStatus.IN_PROGRESS);

        PaymentTransactionResponse response = new PaymentTransactionResponse();

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(paymentTransactionRepository.findFirstByBooking_IdAndPurposeAndStatusOrderByCreatedAtDesc(
                bookingId,
                PaymentPurpose.FINAL_PAYMENT,
                PaymentStatus.PENDING
        )).thenReturn(Optional.empty());
        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));
        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(response);

        PaymentTransactionResponse result = paymentTransactionService.settleFinalPaymentByCash(bookingId);

        assertNotNull(result);
        assertEquals(BigDecimal.ZERO, booking.getRemainingAmount());
        assertEquals(BookingStatus.COMPLETED, booking.getStatus());
        verify(bookingNotificationService).sendNotification(booking, BookingNotificationEventType.BOOKING_COMPLETED);
        verify(bookingRepository).save(booking);
    }
}

