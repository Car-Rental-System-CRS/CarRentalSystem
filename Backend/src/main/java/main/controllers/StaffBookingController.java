package main.controllers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import main.dtos.request.CarConditionRequest;
import main.dtos.response.CarConditionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.PageResponse;
import main.entities.Booking;
import main.enums.BookingStatus;
import main.services.BookingService;
import main.specification.BookingSpecification;

@RestController
@RequestMapping("/api/staff/bookings")
@RequiredArgsConstructor
public class StaffBookingController {

    private final BookingService bookingService;

    /**
     * Get all bookings with filtering and pagination.
     * Requires STAFF role + BOOKING_MANAGE scope.
     */
    @GetMapping
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PageResponse<AdminBookingResponse>>> getAllBookings(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) LocalDateTime dateFrom,
            @RequestParam(required = false) LocalDateTime dateTo,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            Pageable pageable
    ) {
        Specification<Booking> specification = Specification
                .where(BookingSpecification.customerSearch(search))
                .and(BookingSpecification.hasStatus(status))
                .and(BookingSpecification.expectedReceiveDateFrom(dateFrom))
                .and(BookingSpecification.expectedReturnDateTo(dateTo))
                .and(BookingSpecification.minPrice(minPrice))
                .and(BookingSpecification.maxPrice(maxPrice));

        Page<AdminBookingResponse> result = bookingService.getAllBookings(specification, pageable);
        PageResponse<AdminBookingResponse> pageResponse = PageResponse.from(result);

        return ResponseEntity.ok(
                APIResponse.<PageResponse<AdminBookingResponse>>builder()
                        .success(true)
                        .message("OK")
                        .data(pageResponse)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    /**
     * Get single booking details (staff view)
     */
    @GetMapping("/{bookingId}")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> getBookingById(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.getAdminBookingById(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    /**
     * Confirm car pickup — CONFIRMED → IN_PROGRESS
     */
    @PutMapping("/{bookingId}/confirm-pickup")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> confirmPickup(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.confirmPickup(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("Car pickup confirmed successfully")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    /**
     * Confirm car return — IN_PROGRESS → COMPLETED (or pending overdue payment)
     */
    @PutMapping("/{bookingId}/confirm-return")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> confirmReturn(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.confirmReturn(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("Car return confirmed successfully")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PostMapping("/{bookingId}/post-trip-car-conditions")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<List<CarConditionResponse>>> uploadPostTripCarConditions(
            @PathVariable UUID bookingId,
            @RequestBody List<CarConditionRequest> conditions) {
        List<CarConditionResponse> result = bookingService.uploadPostTripCarConditions(bookingId, conditions);
        return ResponseEntity.ok(
                APIResponse.<List<CarConditionResponse>>builder()
                        .success(true)
                        .message("Car conditions uploaded successfully")
                        .data(result)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PostMapping("/{bookingId}/generate-final-payment-qr")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> generateFinalPaymentQr(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.generateFinalPaymentQr(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("Final payment QR generated")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{bookingId}/mark-overdue-paid")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> markOverduePaid(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.markOverduePaid(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("Overdue charge marked as paid")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{bookingId}/mark-final-paid")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<AdminBookingResponse>> markFinalPaid(
            @PathVariable UUID bookingId) {
        AdminBookingResponse booking = bookingService.markFinalPaid(bookingId);
        return ResponseEntity.ok(
                APIResponse.<AdminBookingResponse>builder()
                        .success(true)
                        .message("Final payment marked as paid")
                        .data(booking)
                        .timestamp(Instant.now())
                        .build()
        );
    }

}
