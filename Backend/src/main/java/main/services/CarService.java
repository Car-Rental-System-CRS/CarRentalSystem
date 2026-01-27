package main.services;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;

import java.util.List;
import java.util.UUID;

public interface CarService {
    CarResponse create(CreateCarRequest request);

    CarResponse getById(UUID carId);

    List<CarResponse> getAll();

    CarResponse update(UUID carId, CreateCarRequest request);

    void delete(UUID carId);
}
