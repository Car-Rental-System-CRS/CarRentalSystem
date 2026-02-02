package main.services;

import main.dtos.request.CreateBookingRequest;
import main.dtos.response.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    // Create booking (account will come from session/JWT later)
    BookingResponse createBooking(CreateBookingRequest request);

    // Get booking by id
    BookingResponse getBookingById(UUID bookingId);

    // Get all bookings of current user
    List<BookingResponse> getMyBookings();

    // Cancel booking (business rules applied inside)
    void cancelBooking(UUID bookingId);
}
