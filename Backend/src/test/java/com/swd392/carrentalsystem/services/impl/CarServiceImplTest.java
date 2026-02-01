package com.swd392.carrentalsystem.services.impl;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import main.entities.CarType;
import main.mappers.CarMapper;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.services.impl.CarServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentMatchers;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockedStatic;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CarServiceImplTest {

    @Mock
    private CarRepository carRepository;

    @Mock
    private CarTypeRepository carTypeRepository;

    @InjectMocks
    private CarServiceImpl carService;

    // ===== CREATE =====
    @Test
    void createCar_ShouldReturnResponse_WhenRequestIsValid() {

        UUID typeId = UUID.randomUUID();

        CreateCarRequest request = new CreateCarRequest();
        request.setTypeId(typeId);
        request.setLicensePlate("ABC-123");
        request.setImportDate(LocalDate.now());

        CarType type = new CarType();
        Car entity = new Car();
        Car saved = new Car();
        CarResponse response = new CarResponse();

        when(carTypeRepository.findById(typeId))
                .thenReturn(Optional.of(type));

        when(carRepository.save(entity))
                .thenReturn(saved);

        try (MockedStatic<CarMapper> mapper = mockStatic(CarMapper.class)) {

            mapper.when(() -> CarMapper.toEntity(request, type))
                    .thenReturn(entity);

            mapper.when(() -> CarMapper.toResponse(saved))
                    .thenReturn(response);

            CarResponse result = carService.createCar(request);

            assertNotNull(result);
            verify(carRepository).save(entity);
        }
    }

    // ===== GET BY ID =====
    @Test
    void getCarById_ShouldReturnResponse_WhenCarExists() {

        UUID id = UUID.randomUUID();

        Car entity = new Car();
        CarResponse response = new CarResponse();

        when(carRepository.findById(id))
                .thenReturn(Optional.of(entity));

        try (MockedStatic<CarMapper> mapper = mockStatic(CarMapper.class)) {

            mapper.when(() -> CarMapper.toResponse(entity))
                    .thenReturn(response);

            CarResponse result = carService.getCarById(id);

            assertNotNull(result);
        }
    }

    // ===== GET ALL =====
    @Test
    void getAllCars_ShouldReturnPagedResult_WhenRequestIsValid() {

        Pageable pageable = PageRequest.of(0, 5);

        Car entity = new Car();
        CarResponse response = new CarResponse();

        Page<Car> page = new PageImpl<>(List.of(entity));

        when(carRepository.findAll(
                ArgumentMatchers.<Specification<Car>>any(),
                any(Pageable.class)
        )).thenReturn(page);

        try (MockedStatic<CarMapper> mapper = mockStatic(CarMapper.class)) {

            mapper.when(() -> CarMapper.toResponse(entity))
                    .thenReturn(response);

            Page<CarResponse> result =
                    carService.getAllCars(pageable, null);

            assertEquals(1, result.getTotalElements());
        }
    }

    // ===== UPDATE =====
    @Test
    void updateCar_ShouldUpdateAndReturnResponse_WhenCarExists() {

        UUID id = UUID.randomUUID();
        UUID typeId = UUID.randomUUID();

        CreateCarRequest request = new CreateCarRequest();
        request.setTypeId(typeId);
        request.setLicensePlate("NEW-999");
        request.setImportDate(LocalDate.now());

        Car entity = new Car();
        CarType type = new CarType();
        Car saved = new Car();
        CarResponse response = new CarResponse();

        when(carRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carTypeRepository.findById(typeId))
                .thenReturn(Optional.of(type));

        when(carRepository.save(entity))
                .thenReturn(saved);

        try (MockedStatic<CarMapper> mapper = mockStatic(CarMapper.class)) {

            mapper.when(() -> CarMapper.toResponse(saved))
                    .thenReturn(response);

            CarResponse result =
                    carService.updateCar(id, request);

            assertNotNull(result);
            assertEquals("NEW-999", entity.getLicensePlate());
            assertEquals(type, entity.getCarType());
        }
    }

    // ===== DELETE =====
    @Test
    void deleteCar_ShouldDelete_WhenCarExists() {

        UUID id = UUID.randomUUID();

        when(carRepository.existsById(id))
                .thenReturn(true);

        carService.deleteCar(id);

        verify(carRepository).deleteById(id);
    }
}
