package com.swd392.carrentalsystem.services.impl;

import main.dtos.response.ModelFeatureResponse;
import main.entities.CarFeature;
import main.entities.CarType;
import main.entities.ModelFeature;
import main.mappers.ModelFeatureMapper;
import main.repositories.CarFeatureRepository;
import main.repositories.CarTypeRepository;
import main.repositories.ModelFeatureRepository;
import main.services.impl.ModelFeatureServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ModelFeatureServiceImplTest {

    @Mock
    private ModelFeatureRepository modelFeatureRepository;

    @Mock
    private CarTypeRepository carTypeRepository;

    @Mock
    private CarFeatureRepository carFeatureRepository;

    @InjectMocks
    private ModelFeatureServiceImpl service;

    // ================================
    // ATTACH ONE
    // ================================
    @Test
    void attachFeatureToType_shouldAddToCollection_whenValid() {

        UUID typeId = UUID.randomUUID();
        UUID featureId = UUID.randomUUID();

        CarType type = new CarType();
        type.setModelFeatures(new ArrayList<>());

        CarFeature feature = new CarFeature();
        feature.setId(featureId);

        ModelFeature mf = new ModelFeature();

        when(modelFeatureRepository.existsByCarType_IdAndCarFeature_Id(typeId, featureId))
                .thenReturn(false);

        when(carTypeRepository.findById(typeId)).thenReturn(Optional.of(type));
        when(carFeatureRepository.findById(featureId)).thenReturn(Optional.of(feature));

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {

            mapper.when(() -> ModelFeatureMapper.toEntity(type, feature))
                    .thenReturn(mf);

            service.attachFeatureToType(typeId, featureId);

            assertEquals(1, type.getModelFeatures().size());
            assertSame(mf, type.getModelFeatures().get(0));
        }

        verify(modelFeatureRepository, never()).save(any());
    }

    // ================================
    // ATTACH BULK
    // ================================
    @Test
    void attachFeaturesBulk_shouldAddOnlyNewMappings() {

        UUID typeId = UUID.randomUUID();
        UUID f1 = UUID.randomUUID();
        UUID f2 = UUID.randomUUID();

        CarType type = new CarType();
        type.setModelFeatures(new ArrayList<>());

        CarFeature feature1 = new CarFeature();
        feature1.setId(f1);

        CarFeature feature2 = new CarFeature();
        feature2.setId(f2);

        when(carTypeRepository.findById(typeId)).thenReturn(Optional.of(type));
        when(carFeatureRepository.findAllById(List.of(f1, f2)))
                .thenReturn(List.of(feature1, feature2));

        when(modelFeatureRepository.existsByCarType_IdAndCarFeature_Id(typeId, f1))
                .thenReturn(false);

        when(modelFeatureRepository.existsByCarType_IdAndCarFeature_Id(typeId, f2))
                .thenReturn(true); // already exists → skipped

        ModelFeature mf1 = new ModelFeature();

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {

            mapper.when(() -> ModelFeatureMapper.toEntity(type, feature1))
                    .thenReturn(mf1);

            service.attachFeaturesBulk(typeId, List.of(f1, f2));

            assertEquals(1, type.getModelFeatures().size());
        }
    }

    // ================================
    // REMOVE ONE (CASCADE)
    // ================================
    @Test
    void removeFeatureFromType_shouldRemoveFromCollection() {

        UUID typeId = UUID.randomUUID();
        UUID featureId = UUID.randomUUID();

        CarFeature feature = new CarFeature();
        feature.setId(featureId);

        ModelFeature mf = new ModelFeature();
        mf.setCarFeature(feature);

        CarType type = new CarType();
        type.setModelFeatures(new ArrayList<>(List.of(mf)));

        when(carTypeRepository.findById(typeId)).thenReturn(Optional.of(type));

        service.removeFeatureFromType(typeId, featureId);

        assertTrue(type.getModelFeatures().isEmpty());
    }

    // ================================
    // DETACH BULK
    // ================================
    @Test
    void detachFeaturesBulk_shouldRemoveMatchingOnly() {

        UUID typeId = UUID.randomUUID();
        UUID f1 = UUID.randomUUID();
        UUID f2 = UUID.randomUUID();

        ModelFeature mf1 = new ModelFeature();
        CarFeature cf1 = new CarFeature();
        cf1.setId(f1);
        mf1.setCarFeature(cf1);

        ModelFeature mf2 = new ModelFeature();
        CarFeature cf2 = new CarFeature();
        cf2.setId(f2);
        mf2.setCarFeature(cf2);

        CarType type = new CarType();
        type.setModelFeatures(new ArrayList<>(List.of(mf1, mf2)));

        when(carTypeRepository.findById(typeId)).thenReturn(Optional.of(type));

        service.detachFeaturesBulk(typeId, List.of(f1));

        assertEquals(1, type.getModelFeatures().size());
        assertEquals(f2, type.getModelFeatures().get(0).getCarFeature().getId());
    }

    // ================================
    // REPLACE FEATURES
    // ================================
    @Test
    void replaceFeatures_shouldClearThenAttach() {

        UUID typeId = UUID.randomUUID();
        UUID featureId = UUID.randomUUID();

        CarType type = new CarType();
        type.setModelFeatures(new ArrayList<>(List.of(new ModelFeature())));

        CarFeature feature = new CarFeature();
        feature.setId(featureId);

        when(carTypeRepository.findById(typeId)).thenReturn(Optional.of(type));
        when(carFeatureRepository.findAllById(List.of(featureId)))
                .thenReturn(List.of(feature));

        when(modelFeatureRepository.existsByCarType_IdAndCarFeature_Id(typeId, featureId))
                .thenReturn(false);

        ModelFeature newMf = new ModelFeature();

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {

            mapper.when(() -> ModelFeatureMapper.toEntity(type, feature))
                    .thenReturn(newMf);

            service.replaceFeatures(typeId, List.of(featureId));

            assertEquals(1, type.getModelFeatures().size());
            assertSame(newMf, type.getModelFeatures().get(0));
        }
    }

    // ================================
    // PAGE TESTS (UNCHANGED)
    // ================================
    @Test
    void getByType_shouldReturnPage() {

        UUID typeId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        ModelFeature entity = new ModelFeature();
        Page<ModelFeature> page = new PageImpl<>(List.of(entity));

        when(modelFeatureRepository.findByCarType_Id(typeId, pageable))
                .thenReturn(page);

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {

            mapper.when(() -> ModelFeatureMapper.toResponse(entity))
                    .thenReturn(new ModelFeatureResponse());

            Page<ModelFeatureResponse> result = service.getByType(typeId, pageable);

            assertEquals(1, result.getTotalElements());
        }
    }
}