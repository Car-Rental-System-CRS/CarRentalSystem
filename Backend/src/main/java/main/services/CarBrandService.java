package main.services;

import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;

import java.util.List;
import java.util.UUID;

public interface CarBrandService {
    CarBrandResponse create(CreateCarBrandRequest request);

    CarBrandResponse getById(UUID brandId);

    List<CarBrandResponse> getAll();

    CarBrandResponse update(UUID brandId, CreateCarBrandRequest request);

    void delete(UUID brandId);
}
