package main.services;

import main.dtos.response.CreateOrderResponse;

public interface BookingService {
    CreateOrderResponse createBooking(Long amount);
    void markPaid(Long orderCode);
}
