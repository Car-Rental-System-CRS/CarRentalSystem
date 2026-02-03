package main.services;

import java.util.List;
import java.util.UUID;

import main.dtos.request.CreateBookingRequest;
import main.dtos.response.BookingResponse;

public interface BookingService {

    // Create booking (account will come from session/JWT later)
    BookingResponse createBooking(CreateBookingRequest request, UUID accountId) ;

    // Get booking by id
    BookingResponse getBookingById(UUID bookingId);

    // Get all bookings of current user
    List<BookingResponse> getMyBookings();

    // Cancel booking (business rules applied inside)
    void cancelBooking(UUID bookingId);
}
