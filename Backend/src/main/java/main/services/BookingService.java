package main.services;

import java.util.List;
import java.util.UUID;

import main.dtos.request.ConfirmPostTripRequest;
import main.dtos.request.PostTripConditionRequest;
import main.dtos.response.PostTripConditionResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import main.dtos.request.CreateBookingRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
import main.entities.Booking;
import org.springframework.web.multipart.MultipartFile;

public interface BookingService {

    // Create booking (account will come from session/JWT later)
    BookingResponse createBooking(CreateBookingRequest request, UUID accountId) ;

    // Get booking by id
    BookingResponse getBookingById(UUID bookingId);

    // Get all bookings of current user
    List<BookingResponse> getMyBookings(UUID accountId);

    // Cancel booking (business rules applied inside)
    void cancelBooking(UUID bookingId);

    // Get all bookings with filtering and pagination (for staff/admin)
    Page<AdminBookingResponse> getAllBookings(Specification<Booking> specification, Pageable pageable);

    // Get single booking detail (staff/admin view)
    AdminBookingResponse getAdminBookingById(UUID bookingId);

    // Confirm car pickup — CONFIRMED → IN_PROGRESS
    AdminBookingResponse confirmPickup(UUID bookingId);

    // Confirm car return — IN_PROGRESS → COMPLETED (or pending overdue payment)
    AdminBookingResponse confirmReturn(UUID bookingId);

    /**
     * Flow 2 - return - STEP 1 — Staff records the exact moment the user returns the vehicle.
     * Transition: IN_PROGRESS → RETURNED
     * Also triggers overdue fee calculation based on actualReturnTime vs expectedReturnDate.
     */
    PostTripConditionResponse recordReturnTimestamp(UUID bookingId);

    /**
     * Flow 2 - return - STEP 2 — Staff uploads post-trip photos + condition report.
     * Transition: RETURNED → PENDING_USER_CONFIRMATION
     * Calculates damage fee if damageNotes are present.
     * Sets postTripConfirmationStatus = PENDING_USER.
     */
    PostTripConditionResponse uploadPostTripCondition(
            UUID bookingId,
            PostTripConditionRequest request,
            List<MultipartFile> photos
    );

    /**
     * Flow 2 - return - STEP 3 — User reviews post-trip condition and either accepts or disputes.
     * ACCEPT  → postTripConfirmationStatus = ACCEPTED, booking ready for payment
     * DISPUTE → postTripConfirmationStatus = DISPUTED, flags for staff resolution
     */
    /** 3.1: review the post trip condition*/
    PostTripConditionResponse getPostTripCondition(UUID bookingId, UUID accountId);
    /** 3.2: confirmation or dispute */
    PostTripConditionResponse confirmPostTripCondition(
            UUID bookingId,
            UUID userId,
            ConfirmPostTripRequest request
    );

    /**
     * Flow 2 - return - STEP 4 (cash path) — Staff marks final payment received in cash.
     * Transition: PENDING_USER_CONFIRMATION (accepted) → COMPLETED
     * Only callable after postTripConfirmationStatus = ACCEPTED.
     */
    PostTripConditionResponse markFinalPaid(UUID bookingId);
}
