package main.controllers;

import java.nio.file.attribute.UserPrincipal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

import jakarta.validation.Valid;
import main.dtos.APIResponse;
import main.dtos.request.ConfirmPostTripRequest;
import main.dtos.response.PostTripConditionResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
import main.dtos.response.BookingResponse;
import main.security.CustomUserDetails;
import main.services.BookingService;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    /**
     * Create booking + create booking payment
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @RequestBody CreateBookingRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        BookingResponse response = bookingService.createBooking(request, userDetails.getAccountId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Get all bookings of current user
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        List<BookingResponse> response = bookingService.getMyBookings(userDetails.getAccountId());
        return ResponseEntity.ok(response);
    }

    /**
     * Get booking by id
     */
    @GetMapping("/{bookingId}")
    public ResponseEntity<BookingResponse> getBookingById(
            @PathVariable UUID bookingId
    ) {
        BookingResponse response = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Flow 2 - return vehicle - STEP 3 — User reviews post-trip condition photos and either accepts or disputes.
     *
     * ACCEPT  → booking moves to PENDING_PAYMENT (ready for QR or cash)
     * DISPUTE → booking moves to DISPUTED (staff must resolve manually)
     *
     * PUT /api/bookings/{bookingId}/confirm-post-trip-condition
     *
     * Request body:
     * {
     *   "action": "ACCEPT"          // or "DISPUTE"
     *   "disputeReason": "..."      // required only when action = DISPUTE
     * }
     */
    /**
     * User views the post-trip condition report uploaded by staff.
     * Must be called before confirm-post-trip-condition.
     *
     * GET /api/bookings/{bookingId}/post-trip-condition
     */
    @GetMapping("/{bookingId}/post-trip-condition")
    public ResponseEntity<APIResponse<PostTripConditionResponse>> getPostTripCondition(
            @PathVariable UUID bookingId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PostTripConditionResponse data = bookingService.getPostTripCondition(
                bookingId,
                userDetails.getAccountId()
        );

        return ResponseEntity.ok(APIResponse.<PostTripConditionResponse>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @PutMapping("/{bookingId}/confirm-post-trip-condition")
    public ResponseEntity<APIResponse<PostTripConditionResponse>> confirmPostTripCondition(
            @PathVariable UUID bookingId,
            @RequestBody @Valid ConfirmPostTripRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        PostTripConditionResponse response = bookingService.confirmPostTripCondition(
                bookingId,
                userDetails.getAccountId(),
                request
        );

        String message = request.getAction() == ConfirmPostTripRequest.Action.ACCEPT
                ? "Condition accepted. Please proceed to payment."
                : "Dispute submitted. Our staff will contact you shortly.";

        return ResponseEntity.ok(
                APIResponse.<PostTripConditionResponse>builder()
                        .success(true)
                        .message(message)
                        .data(response)
                        .timestamp(Instant.now())
                        .build()
        );
    }


}
