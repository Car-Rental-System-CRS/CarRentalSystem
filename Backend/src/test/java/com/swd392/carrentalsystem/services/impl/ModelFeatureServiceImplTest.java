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

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ModelFeatureServiceImplTest {

    @Mock
    private ModelFeatureRepository modelFeatureRepository;

    @Mock
    private CarTypeRepository carTypeRepository;

    @Mock
    private CarFeatureRepository carFeatureRepository;

    @InjectMocks
    private ModelFeatureServiceImpl service;

    @Test
    void attachFeatureToType_shouldSave_whenValid() {
        UUID typeId = UUID.randomUUID();
        UUID featureId = UUID.randomUUID();

        CarType type = new CarType();
        CarFeature feature = new CarFeature();
        ModelFeature entity = new ModelFeature();

        when(modelFeatureRepository.existsByCarTypeIdAndCarFeatureId(typeId, featureId))
                .thenReturn(false);

        when(carTypeRepository.findById(typeId))
                .thenReturn(Optional.of(type));

        when(carFeatureRepository.findById(featureId))
                .thenReturn(Optional.of(feature));

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {
            mapper.when(() -> ModelFeatureMapper.toEntity(type, feature))
                    .thenReturn(entity);

            service.attachFeatureToType(typeId, featureId);

            verify(modelFeatureRepository).save(entity);
        }
    }

    @Test
    void removeFeatureFromType_shouldDelete_whenMappingExists() {
        UUID typeId = UUID.randomUUID();
        UUID featureId = UUID.randomUUID();

        when(modelFeatureRepository.existsByCarTypeIdAndCarFeatureId(typeId, featureId))
                .thenReturn(true);

        service.removeFeatureFromType(typeId, featureId);

        verify(modelFeatureRepository)
                .deleteByCarTypeIdAndCarFeatureId(typeId, featureId);
    }

    @Test
    void getByType_shouldReturnPage() {
        UUID typeId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        ModelFeature entity = new ModelFeature();
        ModelFeatureResponse response = new ModelFeatureResponse();

        Page<ModelFeature> page = new PageImpl<>(List.of(entity));

        when(modelFeatureRepository.findByCarTypeId(typeId, pageable))
                .thenReturn(page);

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {
            mapper.when(() -> ModelFeatureMapper.toResponse(entity))
                    .thenReturn(response);

            Page<ModelFeatureResponse> result = service.getByType(typeId, pageable);

            assertEquals(1, result.getTotalElements());
        }
    }

    @Test
    void getByFeature_shouldReturnPage() {
        UUID featureId = UUID.randomUUID();
        Pageable pageable = PageRequest.of(0, 10);

        ModelFeature entity = new ModelFeature();
        ModelFeatureResponse response = new ModelFeatureResponse();

        Page<ModelFeature> page = new PageImpl<>(List.of(entity));

        when(modelFeatureRepository.findByCarFeatureId(featureId, pageable))
                .thenReturn(page);

        try (MockedStatic<ModelFeatureMapper> mapper = mockStatic(ModelFeatureMapper.class)) {
            mapper.when(() -> ModelFeatureMapper.toResponse(entity))
                    .thenReturn(response);

            Page<ModelFeatureResponse> result = service.getByFeature(featureId, pageable);

            assertEquals(1, result.getTotalElements());
        }
    }

}
