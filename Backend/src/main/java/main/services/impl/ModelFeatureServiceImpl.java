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
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
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
        if (modelFeatureRepository.existsByCarType_IdAndCarFeature_Id(typeId, featureId)) {
            throw new IllegalArgumentException("Feature already attached to this car type");
        }

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        CarFeature feature = carFeatureRepository.findById(featureId)
                .orElseThrow(() -> new IllegalArgumentException("Feature not found"));

        ModelFeature entity = ModelFeatureMapper.toEntity(type, feature);

        type.getModelFeatures().add(entity);
    }

    // ===== REMOVE =====
    @Override
    @Transactional
    public void removeFeatureFromType(UUID typeId, UUID featureId) {

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        boolean removed = type.getModelFeatures()
                .removeIf(mf -> mf.getCarFeature().getId().equals(featureId));

        if (!removed) {
            throw new IllegalArgumentException("Mapping does not exist");
        }
    }

    @Override
    @Transactional
    public void attachFeaturesBulk(UUID typeId, List<UUID> featureIds) {

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        var features = carFeatureRepository.findAllById(featureIds);

        if (features.size() != featureIds.size()) {
            throw new IllegalArgumentException("Some features not found");
        }

        features.stream()
                .filter(f -> !modelFeatureRepository
                        .existsByCarType_IdAndCarFeature_Id(typeId, f.getId()))
                .map(f -> ModelFeatureMapper.toEntity(type, f))
                .forEach(type.getModelFeatures()::add);
    }

    @Override
    @Transactional
    public void replaceFeatures(UUID typeId, List<UUID> featureIds) {

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        // cascade delete join rows
        type.getModelFeatures().clear();

        attachFeaturesBulk(typeId, featureIds);
    }

    @Override
    @Transactional
    public void detachFeaturesBulk(UUID typeId, List<UUID> featureIds) {

        CarType type = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found"));

        type.getModelFeatures()
                .removeIf(mf -> featureIds.contains(
                        mf.getCarFeature().getId()
                ));
    }

    // ===== PAGE FEATURES OF TYPE =====
    @Override
    public Page<ModelFeatureResponse> getByType(UUID typeId, Pageable pageable) {
        return modelFeatureRepository
                .findByCarType_Id(typeId, pageable)
                .map(ModelFeatureMapper::toResponse);
    }

    // ===== PAGE TYPES HAVING FEATURE =====
    @Override
    public Page<ModelFeatureResponse> getByFeature(UUID featureId, Pageable pageable) {
        return modelFeatureRepository
                .findByCarFeature_Id(featureId, pageable)
                .map(ModelFeatureMapper::toResponse);
    }
}
