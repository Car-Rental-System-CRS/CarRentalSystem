package main.services;

import main.dtos.response.CarConditionResponse;

import java.util.List;
import java.util.UUID;

public interface CarConditionService {
    List<CarConditionResponse> getByBookingId(UUID bookingId);
}
