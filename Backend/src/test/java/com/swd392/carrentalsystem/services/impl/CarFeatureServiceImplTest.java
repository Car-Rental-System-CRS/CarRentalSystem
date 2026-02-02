package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.entities.CarFeature;
import main.mappers.CarFeatureMapper;
import main.repositories.CarFeatureRepository;
import main.services.impl.CarFeatureServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarFeatureServiceImplTest {

    @Mock
    private CarFeatureRepository carFeatureRepository;

    @Mock
    private CarFeatureMapper carFeatureMapper;

    @InjectMocks
    private CarFeatureServiceImpl carFeatureService;

    // ===== CREATE =====
    @Test
    void createFeature_ShouldReturnResponse_WhenRequestIsValid() {

        CreateCarFeatureRequest request = new CreateCarFeatureRequest();
        request.setName("GPS");

        CarFeature entity = new CarFeature();
        CarFeature saved = new CarFeature();
        CarFeatureResponse response = new CarFeatureResponse();

        when(carFeatureMapper.toEntity(request)).thenReturn(entity);
        when(carFeatureRepository.save(entity)).thenReturn(saved);
        when(carFeatureMapper.toResponse(saved)).thenReturn(response);

        CarFeatureResponse result = carFeatureService.createFeature(request);

        assertNotNull(result);
        verify(carFeatureRepository).save(entity);
    }

    // ===== GET BY ID =====
    @Test
    void getFeatureById_ShouldReturnResponse_WhenFeatureExists() {

        UUID id = UUID.randomUUID();

        CarFeature entity = new CarFeature();
        CarFeatureResponse response = new CarFeatureResponse();

        when(carFeatureRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carFeatureMapper.toResponse(entity))
                .thenReturn(response);

        CarFeatureResponse result = carFeatureService.getFeatureById(id);

        assertNotNull(result);
    }

    // ===== GET ALL =====
    @Test
    void getAllFeatures_ShouldReturnPagedResult_WhenRequestIsValid() {

        Pageable pageable = PageRequest.of(0, 5);

        CarFeature entity = new CarFeature();
        CarFeatureResponse response = new CarFeatureResponse();

        Page<CarFeature> page = new PageImpl<>(List.of(entity));

        when(carFeatureRepository.findAll(
                ArgumentMatchers.<Specification<CarFeature>>any(),
                any(Pageable.class)
        )).thenReturn(page);

        when(carFeatureMapper.toResponse(entity))
                .thenReturn(response);

        Page<CarFeatureResponse> result =
                carFeatureService.getAllFeatures(pageable, null);

        assertEquals(1, result.getTotalElements());
    }

    // ===== UPDATE =====
    @Test
    void updateFeature_ShouldUpdateAndReturnResponse_WhenFeatureExists() {

        UUID id = UUID.randomUUID();

        CreateCarFeatureRequest request = new CreateCarFeatureRequest();
        request.setName("Camera");

        CarFeature entity = new CarFeature();
        CarFeature saved = new CarFeature();
        CarFeatureResponse response = new CarFeatureResponse();

        when(carFeatureRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carFeatureRepository.save(entity))
                .thenReturn(saved);

        when(carFeatureMapper.toResponse(saved))
                .thenReturn(response);

        CarFeatureResponse result =
                carFeatureService.updateFeature(id, request);

        assertNotNull(result);
        assertEquals("Camera", entity.getName());
    }

    // ===== DELETE =====
    @Test
    void deleteFeature_ShouldDelete_WhenFeatureExists() {

        UUID id = UUID.randomUUID();

        when(carFeatureRepository.existsById(id))
                .thenReturn(true);

        carFeatureService.deleteFeature(id);

        verify(carFeatureRepository).deleteById(id);
    }
}
