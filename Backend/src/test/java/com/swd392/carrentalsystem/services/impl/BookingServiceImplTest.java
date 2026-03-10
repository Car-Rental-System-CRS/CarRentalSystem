package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.CreateBookingRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.*;
import main.enums.BookingStatus;
import main.enums.PaymentPurpose;
import main.mappers.BookingMapper;
import main.repositories.*;
import main.services.PaymentTransactionService;
import main.services.impl.BookingServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    @Mock private PaymentTransactionService paymentTransactionService;
    @Mock private BookingRepository bookingRepository;
    @Mock private BookingMapper bookingMapper;
    @Mock private BookingCarRepository bookingCarRepository;
    @Mock private CarRepository carRepository;
    @Mock private CarTypeRepository carTypeRepository;
    @Mock private AccountRepository accountRepository;

    @InjectMocks
    private BookingServiceImpl bookingService;

    @Test
    void createBooking_PayNow_ShouldCreateBooking_SaveCars_CalculatePrices_AndCreateDepositPayment() {
        UUID accountId = UUID.randomUUID();
        UUID carTypeId = UUID.randomUUID();
        UUID bookingId = UUID.randomUUID();

        LocalDateTime pickup = LocalDateTime.now().plusDays(1).withHour(9).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime returnDt = pickup.plusHours(24);

        CreateBookingRequest req = new CreateBookingRequest();
        req.setCarTypeId(carTypeId);
        req.setExpectedReceiveDate(pickup);
        req.setExpectedReturnDate(returnDt);
        req.setQuantity(1);
        req.setPayNow(true);

        when(carTypeRepository.existsById(carTypeId)).thenReturn(true);

        CarType carType = new CarType();
        carType.setPrice(new BigDecimal("100000"));

        Car car1 = new Car();
        UUID car1Id = UUID.randomUUID();
        car1.setId(car1Id);
        car1.setCarType(carType);

        when(carRepository.findByCarTypeId(carTypeId)).thenReturn(List.of(car1));
        when(bookingCarRepository.findUnavailableCarIds(anyList(), any(), any(), anyList()))
                .thenReturn(Collections.emptyList());

        Account acc = new Account();
        acc.setId(accountId);
        when(accountRepository.findById(accountId)).thenReturn(Optional.of(acc));

        Booking preSaved = Booking.builder()
                .id(bookingId)
                .account(acc)
                .expectedReceiveDate(pickup)
                .expectedReturnDate(returnDt)
                .status(BookingStatus.CREATED)
                .build();

        // Single stub to avoid strict stubbing mismatch
        when(bookingRepository.save(any(Booking.class))).thenReturn(preSaved);

        when(carRepository.findAllById(List.of(car1Id))).thenReturn(List.of(car1));
        when(bookingCarRepository.saveAll(anyList())).thenAnswer(inv -> inv.getArgument(0));

        BookingResponse mapped = new BookingResponse();
        when(bookingMapper.toBookingResponseDto(preSaved)).thenReturn(mapped);

        PaymentTransactionResponse depositRes = new PaymentTransactionResponse();
        depositRes.setPaymentUrl("https://payos/checkout/deposit");
        when(paymentTransactionService.createPayment(eq(bookingId), eq(PaymentPurpose.BOOKING_PAYMENT), any(BigDecimal.class)))
                .thenReturn(depositRes);

        BookingResponse res = bookingService.createBooking(req, accountId);

        assertNotNull(res);
        assertNotNull(res.getPayments());
        assertEquals(1, res.getPayments().size());
        assertEquals("https://payos/checkout/deposit", res.getPayments().get(0).getPaymentUrl());

        ArgumentCaptor<BigDecimal> amountCap = ArgumentCaptor.forClass(BigDecimal.class);
        verify(paymentTransactionService).createPayment(eq(bookingId), eq(PaymentPurpose.BOOKING_PAYMENT), amountCap.capture());
        assertEquals(new BigDecimal("720000"), amountCap.getValue());

        verify(bookingRepository, atLeastOnce()).save(any(Booking.class));
        verify(bookingCarRepository).saveAll(anyList());
        verify(carRepository).findAllById(List.of(car1Id));
        verify(bookingMapper).toBookingResponseDto(preSaved);
    }

    @Test
    void createBooking_NotEnoughCars_ShouldThrowIllegalArgument() {
        UUID accountId = UUID.randomUUID();
        UUID carTypeId = UUID.randomUUID();

        LocalDateTime pickup = LocalDateTime.now().plusDays(1);
        LocalDateTime returnDt = pickup.plusHours(24);

        CreateBookingRequest req = new CreateBookingRequest();
        req.setCarTypeId(carTypeId);
        req.setExpectedReceiveDate(pickup);
        req.setExpectedReturnDate(returnDt);
        req.setQuantity(2);

        when(carTypeRepository.existsById(carTypeId)).thenReturn(true);

        CarType ct = new CarType();
        ct.setPrice(new BigDecimal("100000"));
        Car onlyOneCar = new Car();
        onlyOneCar.setId(UUID.randomUUID());
        onlyOneCar.setCarType(ct);

        when(carRepository.findByCarTypeId(carTypeId)).thenReturn(List.of(onlyOneCar));
        when(bookingCarRepository.findUnavailableCarIds(anyList(), any(), any(), anyList()))
                .thenReturn(Collections.emptyList());

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(req, accountId));
        assertTrue(ex.getMessage().contains("Not enough cars available"));

        verifyNoInteractions(accountRepository, paymentTransactionService, bookingMapper);
    }

    @Test
    void createBooking_InvalidDates_ShouldThrow() {
        UUID accountId = UUID.randomUUID();
        UUID carTypeId = UUID.randomUUID();

        CreateBookingRequest req = new CreateBookingRequest();
        LocalDateTime pickup = LocalDateTime.now().plusDays(1);
        req.setCarTypeId(carTypeId);
        req.setExpectedReceiveDate(pickup);
        req.setExpectedReturnDate(pickup);
        req.setQuantity(1);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class,
                () -> bookingService.createBooking(req, accountId));
        assertTrue(ex.getMessage().contains("Return date must be after pickup date"));
        verifyNoInteractions(carTypeRepository, carRepository, accountRepository, paymentTransactionService);
    }

    @Test
    void getBookingById_ShouldReturnResponseWithPayments() {
        UUID bookingId = UUID.randomUUID();

        Booking booking = new Booking();
        booking.setId(bookingId);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        BookingCar bc = new BookingCar();
        Car car = new Car();
        CarType ct = new CarType();
        ct.setPrice(new BigDecimal("100000"));
        car.setCarType(ct);
        bc.setCar(car);
        when(bookingCarRepository.findByBookingId(bookingId)).thenReturn(List.of(bc));

        BookingResponse mapped = new BookingResponse();
        when(bookingMapper.toBookingResponseDto(booking)).thenReturn(mapped);

        List<PaymentTransactionResponse> payments = List.of(new PaymentTransactionResponse());
        when(paymentTransactionService.getAllByBookingId(bookingId)).thenReturn(payments);

        BookingResponse res = bookingService.getBookingById(bookingId);

        assertNotNull(res);
        assertEquals(payments, res.getPayments());
        verify(bookingRepository).findById(bookingId);
        verify(bookingMapper).toBookingResponseDto(booking);
        verify(paymentTransactionService).getAllByBookingId(bookingId);
    }

    @Test
    void confirmPickup_ShouldMoveConfirmedToInProgress_WhenNotOverdue() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setExpectedReceiveDate(LocalDateTime.now().minusHours(12));

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        AdminBookingResponse res = bookingService.confirmPickup(bookingId);

        assertNotNull(res);
        assertEquals(BookingStatus.IN_PROGRESS, booking.getStatus());
        verify(bookingRepository).save(booking);
    }

    @Test
    void confirmReturn_Overdue_ShouldCreateOverduePayment_AndKeepInProgress() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking.setExpectedReturnDate(LocalDateTime.now().minusHours(2));

        // Prevent null arithmetic
        booking.setBookingPrice(BigDecimal.ZERO);
        booking.setRemainingAmount(BigDecimal.ZERO);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));

        CarType ct = new CarType();
        ct.setPrice(new BigDecimal("100000"));
        Car car = new Car();
        car.setCarType(ct);
        BookingCar bc = new BookingCar();
        bc.setCar(car);

        when(bookingCarRepository.findByBookingId(bookingId)).thenReturn(List.of(bc));
        when(bookingRepository.save(booking)).thenReturn(booking);

        AdminBookingResponse res = bookingService.confirmReturn(bookingId);

        assertNotNull(res);
        ArgumentCaptor<BigDecimal> amtCap = ArgumentCaptor.forClass(BigDecimal.class);
        verify(paymentTransactionService).createPayment(eq(bookingId), eq(PaymentPurpose.OVERDUE_PAYMENT), amtCap.capture());
        assertEquals(new BigDecimal("300000"), amtCap.getValue());

        assertEquals(BookingStatus.IN_PROGRESS, booking.getStatus());
        verify(bookingRepository, atLeastOnce()).save(booking);
    }

    @Test
    void confirmReturn_OnTime_ShouldCompleteBooking_AndNotCreatePayment() {
        UUID bookingId = UUID.randomUUID();
        Booking booking = new Booking();
        booking.setId(bookingId);
        booking.setStatus(BookingStatus.IN_PROGRESS);
        booking.setExpectedReturnDate(LocalDateTime.now().plusHours(1));

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);

        AdminBookingResponse res = bookingService.confirmReturn(bookingId);

        assertNotNull(res);
        assertEquals(BookingStatus.COMPLETED, booking.getStatus());
        verify(bookingRepository).save(booking);
        verifyNoInteractions(bookingCarRepository);
        verify(paymentTransactionService, never()).createPayment(any(), any(), any());
    }

    @Test
    void getAllBookings_ShouldMapToAdminBookingResponse() {
        Booking b1 = new Booking();
        b1.setId(UUID.randomUUID());

        Page<Booking> page = new PageImpl<>(List.of(b1));
        when(bookingRepository.findAll(
                ArgumentMatchers.<Specification<Booking>>any(),
                any(Pageable.class))
        ).thenReturn(page);

        when(bookingCarRepository.findByBookingId(b1.getId())).thenReturn(Collections.emptyList());
        when(paymentTransactionService.getAllByBookingId(b1.getId())).thenReturn(Collections.emptyList());

        Page<AdminBookingResponse> res = bookingService.getAllBookings(null, Pageable.unpaged());

        assertNotNull(res);
        assertEquals(1, res.getTotalElements());
        verify(bookingRepository).findAll(ArgumentMatchers.<Specification<Booking>>any(), any(Pageable.class));
    }

    @Test
    void getAdminBookingById_ShouldReturnMappedAdminResponse() {
        UUID bookingId = UUID.randomUUID();
        Booking b = new Booking();
        b.setId(bookingId);

        when(bookingRepository.findById(bookingId)).thenReturn(Optional.of(b));
        when(bookingCarRepository.findByBookingId(bookingId)).thenReturn(Collections.emptyList());
        when(paymentTransactionService.getAllByBookingId(bookingId)).thenReturn(Collections.emptyList());

        AdminBookingResponse res = bookingService.getAdminBookingById(bookingId);

        assertNotNull(res);
        verify(bookingRepository).findById(bookingId);
        verify(bookingCarRepository).findByBookingId(bookingId);
        verify(paymentTransactionService).getAllByBookingId(bookingId);
    }
}