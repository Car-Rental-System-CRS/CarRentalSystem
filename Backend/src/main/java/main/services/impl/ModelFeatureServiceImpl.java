package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.ModelFeatureResponse;
import main.entities.CarFeature;
import main.entities.CarType;
import main.entities.ModelFeature;
import main.mappers.ModelFeatureMapper;
import main.repositories.CarFeatureRepository;
import main.repositories.CarTypeRepository;
import main.repositories.ModelFeatureRepository;
import main.services.ModelFeatureService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModelFeatureServiceImpl implements ModelFeatureService {

    private final ModelFeatureRepository modelFeatureRepository;
    private final CarTypeRepository carTypeRepository;
    private final CarFeatureRepository carFeatureRepository;

    // ===== ATTACH =====
    @Override
    public void attachFeatureToType(UUID typeId, UUID featureId) {
        if (modelFeatureRepository.existsByCarTypeIdAndCarFeatureId(typeId, featureId)) {
            throw new IllegalArgumentException("Feature already attached to this car type");
        }

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        CarFeature feature = carFeatureRepository.findById(featureId)
                .orElseThrow(() -> new IllegalArgumentException("Feature not found"));

        ModelFeature entity = ModelFeatureMapper.toEntity(type, feature);

        modelFeatureRepository.save(entity);
    }

    // ===== REMOVE =====
    @Override
    public void removeFeatureFromType(UUID typeId, UUID featureId) {

        if (!modelFeatureRepository.existsByCarTypeIdAndCarFeatureId(typeId, featureId)) {
            throw new IllegalArgumentException("Mapping does not exist");
        }

        modelFeatureRepository.deleteByCarTypeIdAndCarFeatureId(typeId, featureId);
    }

    // ===== PAGE FEATURES OF TYPE =====
    @Override
    public Page<ModelFeatureResponse> getByType(UUID typeId, Pageable pageable) {
        return modelFeatureRepository
                .findByCarTypeId(typeId, pageable)
                .map(ModelFeatureMapper::toResponse);
    }

    // ===== PAGE TYPES HAVING FEATURE =====
    @Override
    public Page<ModelFeatureResponse> getByFeature(UUID featureId, Pageable pageable) {
        return modelFeatureRepository
                .findByCarFeatureId(featureId, pageable)
                .map(ModelFeatureMapper::toResponse);
    }
}
