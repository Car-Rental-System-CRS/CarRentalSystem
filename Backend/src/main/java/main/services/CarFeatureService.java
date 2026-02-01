package main.services;

import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.entities.CarFeature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.UUID;

public interface CarFeatureService {
    CarFeatureResponse createFeature(CreateCarFeatureRequest request);

    CarFeatureResponse getFeatureById(UUID id);

    Page<CarFeatureResponse> getAllFeatures(
            Pageable pageable,
            Specification<CarFeature> specification
    );

    CarFeatureResponse updateFeature(UUID id, CreateCarFeatureRequest request);

    void deleteFeature(UUID id);
}
