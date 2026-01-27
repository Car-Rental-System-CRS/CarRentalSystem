package main.services;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;

import java.util.List;
import java.util.UUID;

public interface CarTypeService {
    CarTypeResponse create(CreateCarTypeRequest request);

    CarTypeResponse getById(UUID typeId);

    List<CarTypeResponse> getAll();

    CarTypeResponse update(UUID typeId, CreateCarTypeRequest request);

    void delete(UUID typeId);
}
