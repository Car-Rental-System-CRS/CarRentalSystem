package main.controllers;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.StaffPickupRequest;
import main.dtos.request.StaffPostTripInspectionRequest;
import main.dtos.request.StaffReturnRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.MediaFileResponse;
import main.dtos.response.PageResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.dtos.response.PostTripInspectionResponse;
import main.entities.Booking;
import main.enums.BookingStatus;
import main.security.CustomUserDetails;
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
            @PathVariable UUID bookingId,
            @RequestBody(required = false) StaffPickupRequest request) {
        AdminBookingResponse booking = bookingService.confirmPickup(
                bookingId,
                request != null ? request.getPickupNotes() : null
        );
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
            @PathVariable UUID bookingId,
            @RequestBody(required = false) StaffReturnRequest request) {
        AdminBookingResponse booking = bookingService.confirmReturn(
                bookingId,
                request != null ? request.getReturnNotes() : null
        );
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
         * Create final PayOS payment link after return is recorded.
         */
        @PostMapping("/{bookingId}/final-payment")
        @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
        public ResponseEntity<APIResponse<PaymentTransactionResponse>> createFinalPayment(
                        @PathVariable UUID bookingId) {
                PaymentTransactionResponse payment = bookingService.createFinalPayment(bookingId);
                return ResponseEntity.ok(
                                APIResponse.<PaymentTransactionResponse>builder()
                                                .success(true)
                                                .message("Final payment link generated successfully")
                                                .data(payment)
                                                .timestamp(Instant.now())
                                                .build()
                );
        }

        /**
         * Record final payment as cash and complete booking when eligible.
         */
        @PostMapping("/{bookingId}/settle-cash")
        @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
        public ResponseEntity<APIResponse<PaymentTransactionResponse>> settleCash(
                        @PathVariable UUID bookingId) {
                PaymentTransactionResponse payment = bookingService.settleFinalPaymentByCash(bookingId);
                return ResponseEntity.ok(
                                APIResponse.<PaymentTransactionResponse>builder()
                                                .success(true)
                                                .message("Final payment recorded as cash")
                                                .data(payment)
                                                .timestamp(Instant.now())
                                                .build()
                );
        }

    @GetMapping("/{bookingId}/post-trip-inspection")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PostTripInspectionResponse>> getPostTripInspection(
            @PathVariable UUID bookingId
    ) {
        PostTripInspectionResponse inspection = bookingService.getPostTripInspection(bookingId);
        return ResponseEntity.ok(
                APIResponse.<PostTripInspectionResponse>builder()
                        .success(true)
                        .message("OK")
                        .data(inspection)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PutMapping("/{bookingId}/post-trip-inspection")
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<PostTripInspectionResponse>> upsertPostTripInspection(
            @PathVariable UUID bookingId,
            @RequestBody StaffPostTripInspectionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        PostTripInspectionResponse inspection = bookingService.upsertPostTripInspection(
                bookingId,
                request,
                userDetails.getAccountId()
        );
        return ResponseEntity.ok(
                APIResponse.<PostTripInspectionResponse>builder()
                        .success(true)
                        .message("Post-trip inspection saved")
                        .data(inspection)
                        .timestamp(Instant.now())
                        .build()
        );
    }

    @PostMapping(value = "/{bookingId}/cars/{carId}/post-trip-damage-images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STAFF') and hasAuthority('BOOKING_MANAGE')")
    public ResponseEntity<APIResponse<List<MediaFileResponse>>> uploadPostTripDamageImages(
            @PathVariable UUID bookingId,
            @PathVariable UUID carId,
            @RequestParam("images") MultipartFile[] images,
            @RequestParam(value = "imageDescriptions", required = false) List<String> imageDescriptionsList
    ) {
        String[] imageDescriptions = imageDescriptionsList != null
                ? imageDescriptionsList.toArray(String[]::new)
                : new String[0];

        List<MediaFileResponse> uploaded = bookingService.uploadPostTripDamageImages(
                bookingId,
                carId,
                images,
                imageDescriptions
        );

        return ResponseEntity.ok(
                APIResponse.<List<MediaFileResponse>>builder()
                        .success(true)
                        .message("Post-trip damage images uploaded")
                        .data(uploaded)
                        .timestamp(Instant.now())
                        .build()
        );
    }
}
