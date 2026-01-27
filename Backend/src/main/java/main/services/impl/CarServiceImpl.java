package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import main.entities.CarType;
import main.repositories.CarRepository;
import main.repositories.CarTypeRepository;
import main.services.CarService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarServiceImpl implements CarService {

    private final CarRepository carRepository;
    private final CarTypeRepository carTypeRepository;
    private final ModelMapper modelMapper;

    @Override
    public CarResponse create(CreateCarRequest request) {
        CarType type = carTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + request.getTypeId()));

        Car entity = Car.builder()
                .licensePlate(request.getLicensePlate())
                .importDate(request.getImportDate())
                .carType(type)
                .build();

        Car saved = carRepository.save(entity);
        return modelMapper.map(saved, CarResponse.class);
    }

    @Override
    public CarResponse getById(UUID carId) {
        Car entity = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("Car not found: " + carId));

        return modelMapper.map(entity, CarResponse.class);
    }

    @Override
    public List<CarResponse> getAll() {
        return carRepository.findAll().stream()
                .map(c -> modelMapper.map(c, CarResponse.class))
                .toList();
    }

    @Override
    public CarResponse update(UUID carId, CreateCarRequest request) {
        Car entity = carRepository.findById(carId)
                .orElseThrow(() -> new IllegalArgumentException("Car not found: " + carId));

        CarType type = carTypeRepository.findById(request.getTypeId())
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + request.getTypeId()));

        entity.setLicensePlate(request.getLicensePlate());
        entity.setImportDate(request.getImportDate());
        entity.setCarType(type);

        Car saved = carRepository.save(entity);
        return modelMapper.map(saved, CarResponse.class);
    }

    @Override
    public void delete(UUID carId) {
        if (!carRepository.existsById(carId)) {
            throw new IllegalArgumentException("Car not found: " + carId);
        }
        carRepository.deleteById(carId);
    }
}
