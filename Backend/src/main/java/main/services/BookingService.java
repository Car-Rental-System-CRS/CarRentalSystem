package main.services;

import main.dtos.response.CreateBookingResponse;

public interface BookingService {
    CreateBookingResponse createBooking(Long amount);
    void markPaid(Long orderCode);
}
