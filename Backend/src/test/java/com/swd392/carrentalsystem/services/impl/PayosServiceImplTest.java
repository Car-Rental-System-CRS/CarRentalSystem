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
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PayosServiceImplTest {

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

    // ---------------------------------------------------
    // createPayment(...)
    // ---------------------------------------------------

    @Test
    void createPayment_ShouldCreatePendingTransactionAndReturnPaymentUrl() {
        UUID bookingId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(1_000_000);
        PaymentPurpose purpose = PaymentPurpose.BOOKING_PAYMENT;

        Booking booking = new Booking();

        PaymentTransactionResponse mapped = new PaymentTransactionResponse();
        String paymentUrl = "https://payos.test/checkout";

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        when(paymentTransactionRepository.save(any(PaymentTransaction.class)))
                .thenAnswer(inv -> inv.getArgument(0));

        when(payosService.createPaymentLink(anyLong(), eq(amount), eq(bookingId)))
                .thenReturn(paymentUrl);

        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(mapped);

        PaymentTransactionResponse result =
                paymentTransactionService.createPayment(bookingId, purpose, amount);

        assertNotNull(result);
        assertEquals(paymentUrl, result.getPaymentUrl());
        verify(bookingRepository).findById(bookingId);
        verify(paymentTransactionRepository).save(any(PaymentTransaction.class));
        verify(payosService).createPaymentLink(anyLong(), eq(amount), eq(bookingId));
        verify(paymentTransactionMapper).toPaymentTransactionResponse(any(PaymentTransaction.class));
    }

    @Test
    void createPayment_BookingNotFound_ShouldThrow() {
        UUID bookingId = UUID.randomUUID();
        BigDecimal amount = BigDecimal.valueOf(500_000);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentTransactionService.createPayment(bookingId, PaymentPurpose.BOOKING_PAYMENT, amount));
        assertEquals("Booking not found", ex.getMessage());

        verify(bookingRepository).findById(bookingId);
        verifyNoInteractions(paymentTransactionRepository, payosService, paymentTransactionMapper);
    }

    // ---------------------------------------------------
    // getById(...)
    // ---------------------------------------------------

    @Test
    void getById_NotFound_ShouldThrow() {
        UUID txId = UUID.randomUUID();
        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentTransactionService.getById(txId));

        assertEquals("Payment transaction not found", ex.getMessage());
        verify(paymentTransactionRepository).findById(txId);
        verifyNoInteractions(paymentTransactionMapper);
    }

    @Test
    void getById_PendingWithUrl_ShouldReturnResponseWithUrlFromEntity() {
        UUID txId = UUID.randomUUID();
        Booking booking = new Booking();
        BigDecimal amount = BigDecimal.valueOf(100_000);

        PaymentTransaction entity = PaymentTransaction.builder()
                .booking(booking)
                .amount(amount)
                .purpose(PaymentPurpose.BOOKING_PAYMENT)
                .status(PaymentStatus.PENDING)
                .paymentUrl("https://payos.test/url-pending")
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(entity));

        PaymentTransactionResponse mapped = new PaymentTransactionResponse();
        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(mapped);

        PaymentTransactionResponse res = paymentTransactionService.getById(txId);

        assertNotNull(res);
        assertEquals("https://payos.test/url-pending", res.getPaymentUrl());
        verify(paymentTransactionRepository).findById(txId);
        verify(paymentTransactionMapper).toPaymentTransactionResponse(any(PaymentTransaction.class));
    }

    @Test
    void getById_NonPending_ShouldNotOverrideMapperUrl() {
        UUID txId = UUID.randomUUID();
        Booking booking = new Booking();

        PaymentTransaction entity = PaymentTransaction.builder()
                .booking(booking)
                .purpose(PaymentPurpose.BOOKING_PAYMENT)
                .status(PaymentStatus.CANCELLED)
                .paymentUrl("https://entity-url-should-not-override.com")
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(entity));

        PaymentTransactionResponse mapped = new PaymentTransactionResponse();
        mapped.setPaymentUrl("https://mapper-url.com");
        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(mapped);

        PaymentTransactionResponse res = paymentTransactionService.getById(txId);

        assertNotNull(res);
        assertEquals("https://mapper-url.com", res.getPaymentUrl());
        verify(paymentTransactionRepository).findById(txId);
        verify(paymentTransactionMapper).toPaymentTransactionResponse(any(PaymentTransaction.class));
    }

    @Test
    void getById_PendingButEntityUrlNull_ShouldLeaveResponseUrlAsIs() {
        UUID txId = UUID.randomUUID();
        Booking booking = new Booking();

        PaymentTransaction entity = PaymentTransaction.builder()
                .booking(booking)
                .purpose(PaymentPurpose.BOOKING_PAYMENT)
                .status(PaymentStatus.PENDING)
                .paymentUrl(null)
                .build();

        when(paymentTransactionRepository.findById(txId)).thenReturn(Optional.of(entity));

        PaymentTransactionResponse mapped = new PaymentTransactionResponse();
        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(mapped);

        PaymentTransactionResponse res = paymentTransactionService.getById(txId);

        assertNotNull(res);
        assertNull(res.getPaymentUrl());
        verify(paymentTransactionRepository).findById(txId);
        verify(paymentTransactionMapper).toPaymentTransactionResponse(any(PaymentTransaction.class));
    }

    // ---------------------------------------------------
    // getLatestByBookingId(...)
    // ---------------------------------------------------

    @Test
    void getLatestByBookingId_NotFound_ShouldThrow() {
        UUID bookingId = UUID.randomUUID();
        when(paymentTransactionRepository.findFirstByBooking_IdOrderByIdDesc(bookingId))
                .thenReturn(Optional.empty());

        RuntimeException ex = assertThrows(RuntimeException.class,
                () -> paymentTransactionService.getLatestByBookingId(bookingId));

        assertEquals("No payment transaction found for booking", ex.getMessage());
        verify(paymentTransactionRepository).findFirstByBooking_IdOrderByIdDesc(bookingId);
        verifyNoInteractions(paymentTransactionMapper);
    }

    @Test
    void getLatestByBookingId_PendingWithUrl_ShouldReturnResponseWithUrlFromEntity() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();

        PaymentTransaction entity = PaymentTransaction.builder()
                .booking(booking)
                .purpose(PaymentPurpose.BOOKING_PAYMENT)
                .status(PaymentStatus.PENDING)
                .paymentUrl("https://payos.test/latest")
                .build();

        when(paymentTransactionRepository.findFirstByBooking_IdOrderByIdDesc(bookingId))
                .thenReturn(Optional.of(entity));

        PaymentTransactionResponse mapped = new PaymentTransactionResponse();
        when(paymentTransactionMapper.toPaymentTransactionResponse(any(PaymentTransaction.class)))
                .thenReturn(mapped);

        PaymentTransactionResponse res = paymentTransactionService.getLatestByBookingId(bookingId);

        assertNotNull(res);
        assertEquals("https://payos.test/latest", res.getPaymentUrl());
        verify(paymentTransactionRepository).findFirstByBooking_IdOrderByIdDesc(bookingId);
        verify(paymentTransactionMapper).toPaymentTransactionResponse(any(PaymentTransaction.class));
    }
}