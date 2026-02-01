package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import main.entities.CarType;
import main.mappers.CarMapper;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.services.CarService;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final CarTypeRepository carTypeRepository;

    // ===== CREATE =====
    @Override
    public CarResponse createCar(CreateCarRequest request) {

        CarType type = carTypeRepository.findById(request.getTypeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + request.getTypeId()));

        Car entity = CarMapper.toEntity(request, type);

        Car saved = carRepository.save(entity);

        return CarMapper.toResponse(saved);
    }

    // ===== GET BY ID =====
    @Override
    public CarResponse getCarById(UUID id) {
        Car entity = carRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car not found: " + id));

        return CarMapper.toResponse(entity);
    }

    // ===== GET ALL (Specification + Pageable) =====
    @Override
    public Page<CarResponse> getAllCars(
            Pageable pageable,
            Specification<Car> specification
    ) {
        return carRepository
                .findAll(specification, pageable)
                .map(CarMapper::toResponse);
    }

    // ===== UPDATE =====
    @Override
    public CarResponse updateCar(UUID id, CreateCarRequest request) {

        Car entity = carRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car not found: " + id));

        CarType type = carTypeRepository.findById(request.getTypeId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + request.getTypeId()));

        entity.setLicensePlate(request.getLicensePlate());
        entity.setImportDate(request.getImportDate());
        entity.setCarType(type);

        Car saved = carRepository.save(entity);

        return CarMapper.toResponse(saved);
    }

    // ===== DELETE =====
    @Override
    public void deleteCar(UUID id) {
        if (!carRepository.existsById(id)) {
            throw new IllegalArgumentException("Car not found: " + id);
        }

        carRepository.deleteById(id);
    }
}
