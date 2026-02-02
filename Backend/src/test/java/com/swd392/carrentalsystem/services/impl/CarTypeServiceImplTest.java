package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.mappers.CarTypeMapper;
import main.repositories.CarBrandRepository;
import main.repositories.CarTypeRepository;
import main.services.impl.CarTypeServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarTypeServiceImplTest {

    @Mock
    private CarTypeRepository carTypeRepository;

    @Mock
    private CarBrandRepository carBrandRepository;

    @InjectMocks
    private CarTypeServiceImpl carTypeService;

    // ===== CREATE =====
    @Test
    void createType_ShouldReturnResponse_WhenRequestIsValid() {

        UUID brandId = UUID.randomUUID();

        CreateCarTypeRequest request = new CreateCarTypeRequest();
        request.setBrandId(brandId);
        request.setName("Model X");
        request.setNumberOfSeats(5);
        request.setConsumptionKwhPerKm(0.2);
        request.setPrice(BigDecimal.TEN);

        CarBrand brand = new CarBrand();
        CarType entity = new CarType();
        CarType saved = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        when(carBrandRepository.findById(brandId))
                .thenReturn(Optional.of(brand));

        when(carTypeRepository.save(entity))
                .thenReturn(saved);

        try (MockedStatic<CarTypeMapper> mapper = mockStatic(CarTypeMapper.class)) {

            mapper.when(() -> CarTypeMapper.toEntity(request, brand))
                    .thenReturn(entity);

            mapper.when(() -> CarTypeMapper.toResponse(saved))
                    .thenReturn(response);

            CarTypeResponse result = carTypeService.createType(request);

            assertNotNull(result);
            verify(carTypeRepository).save(entity);
        }
    }

    // ===== GET BY ID =====
    @Test
    void getTypeById_ShouldReturnResponse_WhenTypeExists() {

        UUID id = UUID.randomUUID();

        CarType entity = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        when(carTypeRepository.findById(id))
                .thenReturn(Optional.of(entity));

        try (MockedStatic<CarTypeMapper> mapper = mockStatic(CarTypeMapper.class)) {

            mapper.when(() -> CarTypeMapper.toResponse(entity))
                    .thenReturn(response);

            CarTypeResponse result = carTypeService.getTypeById(id);

            assertNotNull(result);
        }
    }

    // ===== GET ALL =====
    @Test
    void getAllTypes_ShouldReturnPagedResult_WhenRequestIsValid() {

        Pageable pageable = PageRequest.of(0, 5);

        CarType entity = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        Page<CarType> page = new PageImpl<>(List.of(entity));

        when(carTypeRepository.findAll(any(Specification.class), eq(pageable)))
                .thenReturn(page);

        try (MockedStatic<CarTypeMapper> mapper = mockStatic(CarTypeMapper.class)) {

            mapper.when(() -> CarTypeMapper.toResponse(entity))
                    .thenReturn(response);

            Page<CarTypeResponse> result =
                    carTypeService.getAllTypes(pageable, null);

            assertEquals(1, result.getTotalElements());
        }
    }

    // ===== UPDATE =====
    @Test
    void updateType_ShouldUpdateAndReturnResponse_WhenTypeExists() {

        UUID id = UUID.randomUUID();
        UUID brandId = UUID.randomUUID();

        CreateCarTypeRequest request = new CreateCarTypeRequest();
        request.setBrandId(brandId);
        request.setName("Updated");
        request.setNumberOfSeats(7);
        request.setConsumptionKwhPerKm(0.3);
        request.setPrice(BigDecimal.ONE);

        CarType entity = new CarType();
        CarBrand brand = new CarBrand();
        CarType saved = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        when(carTypeRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carBrandRepository.findById(brandId))
                .thenReturn(Optional.of(brand));

        when(carTypeRepository.save(entity))
                .thenReturn(saved);

        try (MockedStatic<CarTypeMapper> mapper = mockStatic(CarTypeMapper.class)) {

            mapper.when(() -> CarTypeMapper.toResponse(saved))
                    .thenReturn(response);

            CarTypeResponse result =
                    carTypeService.updateType(id, request);

            assertNotNull(result);
            assertEquals("Updated", entity.getName());
            assertEquals(7, entity.getNumberOfSeats());
            assertEquals(brand, entity.getCarBrand());
        }
    }

    // ===== DELETE =====
    @Test
    void deleteType_ShouldDelete_WhenTypeExists() {

        UUID id = UUID.randomUUID();

        when(carTypeRepository.existsById(id))
                .thenReturn(true);

        carTypeService.deleteType(id);

        verify(carTypeRepository).deleteById(id);
    }
}
