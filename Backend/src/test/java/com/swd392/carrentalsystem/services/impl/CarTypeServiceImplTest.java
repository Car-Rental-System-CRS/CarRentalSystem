package com.swd392.carrentalsystem.services.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.mappers.CarTypeMapper;
import main.repositories.CarBrandRepository;
import main.repositories.CarTypeRepository;
import main.services.MediaFileService;
import main.services.impl.CarTypeServiceImpl;

@ExtendWith(MockitoExtension.class)
class CarTypeServiceImplTest {

    @Mock
    private CarTypeRepository carTypeRepository;

    @Mock
    private CarBrandRepository carBrandRepository;

    @Mock
    private MediaFileService mediaFileService;

    @Mock
    private CarTypeMapper carTypeMapper;

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

        when(carTypeRepository.findById(saved.getId()))
                .thenReturn(Optional.of(saved));

        when(carTypeMapper.toEntity(request, brand))
                .thenReturn(entity);

        when(carTypeMapper.toResponse(saved))
                .thenReturn(response);

        CarTypeResponse result = carTypeService.createType(request, null, null);

        assertNotNull(result);
        verify(carTypeRepository).save(entity);
        verify(carTypeMapper).toEntity(request, brand);
        verify(carTypeMapper).toResponse(saved);
    }

    // ===== GET BY ID =====
    @Test
    void getTypeById_ShouldReturnResponse_WhenTypeExists() {

        UUID id = UUID.randomUUID();

        CarType entity = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        when(carTypeRepository.findById(id))
                .thenReturn(Optional.of(entity));

        when(carTypeMapper.toResponse(entity))
                .thenReturn(response);

        CarTypeResponse result = carTypeService.getTypeById(id);

        assertNotNull(result);
        verify(carTypeMapper).toResponse(entity);
    }

    // ===== GET ALL =====
    @Test
    void getAllTypes_ShouldReturnPagedResult_WhenRequestIsValid() {

        Pageable pageable = PageRequest.of(0, 5);

        CarType entity = new CarType();
        CarTypeResponse response = new CarTypeResponse();

        Page<CarType> page = new PageImpl<>(List.of(entity));

        @SuppressWarnings("unchecked")
        Specification<CarType> anySpec = any(Specification.class);
        when(carTypeRepository.findAll(anySpec, eq(pageable)))
                .thenReturn(page);

        when(carTypeMapper.toResponse(entity))
                .thenReturn(response);

        Page<CarTypeResponse> result =
                carTypeService.getAllTypes(pageable, null);

        assertEquals(1, result.getTotalElements());
        verify(carTypeMapper).toResponse(entity);
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

        when(carTypeRepository.findById(id))
                .thenReturn(Optional.of(saved));

        when(carTypeMapper.toResponse(saved))
                .thenReturn(response);

        CarTypeResponse result =
                carTypeService.updateType(id, request, null, null);

        assertNotNull(result);
        assertEquals("Updated", entity.getName());
        assertEquals(7, entity.getNumberOfSeats());
        assertEquals(brand, entity.getCarBrand());
        verify(carTypeMapper).toResponse(saved);
    }

    // ===== DELETE =====
    @Test
    void deleteType_ShouldDelete_WhenTypeExists() {

        UUID id = UUID.randomUUID();

        when(carTypeRepository.existsById(id))
                .thenReturn(true);

        carTypeService.deleteType(id);

        verify(mediaFileService).deleteMediaFilesByCarType(id);
        verify(carTypeRepository).deleteById(id);
    }
}
