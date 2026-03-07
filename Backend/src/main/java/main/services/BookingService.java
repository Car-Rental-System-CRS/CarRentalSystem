package main.services;

import java.util.List;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import main.dtos.request.CreateBookingRequest;
import main.dtos.response.AdminBookingResponse;
import main.dtos.response.BookingResponse;
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
    AdminBookingResponse confirmPickup(UUID bookingId);

    // Confirm car return — IN_PROGRESS → COMPLETED (or pending overdue payment)
    AdminBookingResponse confirmReturn(UUID bookingId);
}
