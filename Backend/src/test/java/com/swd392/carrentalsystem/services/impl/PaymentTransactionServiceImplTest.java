package com.swd392.carrentalsystem.services.impl;

import main.dtos.response.PaymentTransactionResponse;
import main.entities.Booking;
import main.entities.PaymentTransaction;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import main.mappers.PaymentTransactionMapper;
import main.repositories.BookingRepository;
import main.repositories.PaymentTransactionRepository;
import main.services.PayosService;
import main.services.impl.PaymentTransactionServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

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

    @InjectMocks
    private PaymentTransactionServiceImpl paymentTransactionService;



    @Test
    void createPayment_ShouldCreatePendingTransactionAndReturnPaymentUrl() {

        // Arrange
        UUID bookingId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(1_000_000);
        PaymentPurpose purpose = PaymentPurpose.BOOKING_PAYMENT;

        Booking booking = new Booking();

        PaymentTransaction transaction = PaymentTransaction.builder()
                .booking(booking)
                .amount(amount)
                .purpose(purpose)
                .status(PaymentStatus.PENDING)
                .build();

        PaymentTransactionResponse response =
                new PaymentTransactionResponse();

        String paymentUrl = "https://payos.test/checkout";

        when(bookingRepository.findById(bookingId))
                .thenReturn(Optional.of(booking));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenReturn(transaction);

        when(payosService.createPaymentLink(anyLong(), eq(amount)))
                .thenReturn(paymentUrl);

        when(paymentTransactionMapper.toPaymentTransactionResponse(transaction))
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
        verify(payosService).createPaymentLink(anyLong(), eq(amount));
    }
}


