package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.entities.CarFeature;
import main.mappers.CarFeatureMapper;
import main.repositories.CarFeatureRepository;
import main.services.CarFeatureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarFeatureServiceImpl implements CarFeatureService {

    private final CarFeatureRepository carFeatureRepository;
    private final CarFeatureMapper carFeatureMapper;


    @Override
    public CarFeatureResponse createFeature(CreateCarFeatureRequest request) {
        CarFeature entity = carFeatureMapper.toEntity(request);

        CarFeature saved = carFeatureRepository.save(entity);
        return carFeatureMapper.toResponse(saved);
    }

    @Override
    public CarFeatureResponse getFeatureById(UUID id) {
        CarFeature entity = carFeatureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car feature not found: " + id));

        return carFeatureMapper.toResponse(entity);
    }

    @Override
    public Page<CarFeatureResponse> getAllFeatures(
            Pageable pageable,
            Specification<CarFeature> specification
    ) {
        return carFeatureRepository
                .findAll(specification, pageable)
                .map(carFeatureMapper::toResponse);
    }

    @Override
    public CarFeatureResponse updateFeature(UUID id, CreateCarFeatureRequest request) {
        CarFeature entity = carFeatureRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car feature not found: " + id));

        entity.setName(request.getName());

        CarFeature saved = carFeatureRepository.save(entity);
        return carFeatureMapper.toResponse(saved);
    }

    @Override
    public void deleteFeature(UUID id) {
        if (!carFeatureRepository.existsById(id)) {
            throw new IllegalArgumentException("Car feature not found: " + id);
        }
        carFeatureRepository.deleteById(id);
    }
}
