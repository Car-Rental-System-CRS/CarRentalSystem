package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.entities.CarBrand;
import main.mappers.CarBrandMapper;
import main.repositories.CarBrandRepository;
import main.services.impl.CarBrandServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarBrandServiceImplTest {

    @Mock
    private CarBrandRepository carBrandRepository;

    @InjectMocks
    private CarBrandServiceImpl carBrandService;

    // ===== CREATE =====
    @Test
    void createBrand_ShouldReturnResponse_WhenRequestIsValid() {

        CreateCarBrandRequest request = new CreateCarBrandRequest();
        request.setName("Toyota");

        CarBrand entity = new CarBrand();
        CarBrand saved = new CarBrand();
        CarBrandResponse response = new CarBrandResponse();

        try (MockedStatic<CarBrandMapper> mapper = mockStatic(CarBrandMapper.class)) {

            mapper.when(() -> CarBrandMapper.toEntity(request))
                    .thenReturn(entity);

            when(carBrandRepository.save(entity)).thenReturn(saved);

            mapper.when(() -> CarBrandMapper.toResponse(saved))
                    .thenReturn(response);

            CarBrandResponse result = carBrandService.createBrand(request);

            assertNotNull(result);
        }
    }

    // ===== GET BY ID =====
    @Test
    void getBrandById_ShouldReturnBrand_WhenBrandExists() {

        UUID id = UUID.randomUUID();

        CarBrand entity = new CarBrand();
        CarBrandResponse response = new CarBrandResponse();

        when(carBrandRepository.findById(id))
                .thenReturn(Optional.of(entity));

        try (MockedStatic<CarBrandMapper> mapper = mockStatic(CarBrandMapper.class)) {

            mapper.when(() -> CarBrandMapper.toResponse(entity))
                    .thenReturn(response);

            CarBrandResponse result = carBrandService.getBrandById(id);

            assertNotNull(result);
        }
    }

    // ===== GET ALL =====
    @Test
    void getAllBrands_ShouldReturnPagedResult_WhenRequestIsValid() {

        Pageable pageable = PageRequest.of(0, 5);

        Page<CarBrand> page = new PageImpl<>(List.of(new CarBrand()));

        when(carBrandRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(page);

        Page<CarBrandResponse> result =
                carBrandService.getAllBrands(pageable, null);

        assertNotNull(result);
    }

    // ===== UPDATE =====
    @Test
    void updateBrand_ShouldUpdateAndReturnBrand_WhenBrandExists() {

        UUID id = UUID.randomUUID();

        CreateCarBrandRequest request = new CreateCarBrandRequest();
        request.setName("Honda");

        CarBrand entity = new CarBrand();
        CarBrand saved = new CarBrand();
        CarBrandResponse response = new CarBrandResponse();

        when(carBrandRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carBrandRepository.save(entity))
                .thenReturn(saved);

        try (MockedStatic<CarBrandMapper> mapper = mockStatic(CarBrandMapper.class)) {

            mapper.when(() -> CarBrandMapper.toResponse(saved))
                    .thenReturn(response);

            CarBrandResponse result = carBrandService.updateBrand(id, request);

            assertNotNull(result);
        }
    }

    // ===== DELETE =====
    @Test
    void deleteBrand_ShouldDeleteBrand_WhenBrandExists() {

        UUID id = UUID.randomUUID();

        when(carBrandRepository.existsById(id)).thenReturn(true);

        carBrandService.deleteBrand(id);

        verify(carBrandRepository).deleteById(id);
    }
}
