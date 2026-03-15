package main.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.web.multipart.MultipartFile;

import main.dtos.request.CreateBookingRequest;
import main.dtos.request.StaffPostTripInspectionRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
import main.dtos.response.MediaFileResponse;
import main.dtos.response.PaymentTransactionResponse;
import main.dtos.response.PostTripInspectionResponse;
import main.entities.Booking;

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
    AdminBookingResponse confirmPickup(UUID bookingId, String pickupNotes);

    // Confirm car return — IN_PROGRESS → COMPLETED (or pending overdue payment)
    AdminBookingResponse confirmReturn(UUID bookingId, String returnNotes);

    // Generate final payment link (PayOS) after return is recorded
    PaymentTransactionResponse createFinalPayment(UUID bookingId);

    // Record final payment via cash and complete booking when eligible
    PaymentTransactionResponse settleFinalPaymentByCash(UUID bookingId);

    // Upsert post-trip inspection report (single report per booking)
    PostTripInspectionResponse upsertPostTripInspection(UUID bookingId, StaffPostTripInspectionRequest request, UUID inspectorAccountId);

    // Upload post-trip damage evidence for a booked car under booking scope
    List<MediaFileResponse> uploadPostTripDamageImages(UUID bookingId, UUID carId, MultipartFile[] images, String[] imageDescriptions);

    // Get post-trip inspection report by booking id
    PostTripInspectionResponse getPostTripInspection(UUID bookingId);
}
