package main.services;

import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;

import java.util.List;
import java.util.UUID;

public interface CarFeatureService {
    CarFeatureResponse create(CreateCarFeatureRequest request);

    CarFeatureResponse getById(UUID featureId);

    List<CarFeatureResponse> getAll();

    CarFeatureResponse update(UUID featureId, CreateCarFeatureRequest request);

    void delete(UUID featureId);
}
