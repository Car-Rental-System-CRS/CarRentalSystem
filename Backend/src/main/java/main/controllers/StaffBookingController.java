package main.controllers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;

import main.dtos.request.PostTripConditionRequest;
import main.dtos.response.PostTripConditionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
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
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;



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

    /**
     * FLOW 2- return vehicle - STEP 1 — Staff records vehicle return moment.
     * Requirement: booking status must be IN_PROGRESS
     * Transition: IN_PROGRESS → RETURNED
     * Automatically calculates overdue fee.
     *
     * PUT /api/staff/bookings/{bookingId}/return-timestamp
     */
    @PutMapping("/{bookingId}/return-timestamp")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PostTripConditionResponse>> recordReturnTimestamp(
            @PathVariable UUID bookingId) {

        PostTripConditionResponse data = bookingService.recordReturnTimestamp(bookingId);

        return ResponseEntity.ok(APIResponse.<PostTripConditionResponse>builder()
                .success(true)
                .message("Return timestamp recorded successfully.")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }


    /**
     * FLOW 2- return vehicle - STEP 2 — Staff uploads post-trip condition report + photos.
     * Transition: RETURNED → PENDING_USER_CONFIRMATION
     *
     * Multipart form:
     *   "condition" → JSON: { overallConditionRating, odometerReading, fuelLevel, damageNotes }
     *   "photos"    → one or more image files
     *
     * PUT /api/staff/bookings/{bookingId}/upload-post-trip-condition
     */
    @PutMapping(
            value = "/{bookingId}/upload-post-trip-condition",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PostTripConditionResponse>> uploadPostTripCondition(
            @PathVariable UUID bookingId,
            @RequestParam("overallConditionRating") BigDecimal overallConditionRating,
            @RequestParam("odometerReading") Integer odometerReading,
            @RequestParam("fuelLevel") String fuelLevel,
            @RequestParam(value = "damageNotes", required = false) String damageNotes,
            @RequestPart("photos") List<MultipartFile> photos) {

        // Manual null checks
        if (overallConditionRating == null) {
            throw new IllegalArgumentException("overallConditionRating is required");
        }
        if (odometerReading == null) {
            throw new IllegalArgumentException("odometerReading is required");
        }
        if (fuelLevel == null || fuelLevel.isBlank()) {
            throw new IllegalArgumentException("fuelLevel is required");
        }

        // Build request object for service
        PostTripConditionRequest request = new PostTripConditionRequest();
        request.setOverallConditionRating(overallConditionRating);
        request.setOdometerReading(odometerReading);
        request.setFuelLevel(fuelLevel);
        request.setDamageNotes(damageNotes);

        PostTripConditionResponse data =
                bookingService.uploadPostTripCondition(bookingId, request, photos);

        return ResponseEntity.ok(APIResponse.<PostTripConditionResponse>builder()
                .success(true)
                .message("Post-trip condition uploaded. Awaiting user confirmation.")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }


    /**
     * Flow 2 - return vehicle - STEP 4 (optional cash path) — Staff confirms cash payment received.
     * Transition: PENDING_PAYMENT → COMPLETED
     * Guard: user must have already ACCEPTED the condition report (step 3).
     *
     * PUT /api/staff/bookings/{bookingId}/mark-final-paid
     */
    @PutMapping("/{bookingId}/mark-final-paid")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PostTripConditionResponse>> markFinalPaid(
            @PathVariable UUID bookingId) {

        PostTripConditionResponse data = bookingService.markFinalPaid(bookingId);

        return ResponseEntity.ok(APIResponse.<PostTripConditionResponse>builder()
                .success(true)
                .message("Cash payment confirmed. Booking completed.")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }
}
