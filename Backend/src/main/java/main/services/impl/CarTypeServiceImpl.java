package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.repositories.CarBrandRepository;
import main.repositories.CarTypeRepository;
import main.services.CarTypeService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarTypeServiceImpl implements CarTypeService {
    private final CarTypeRepository carTypeRepository;
    private final CarBrandRepository carBrandRepository;
    private final ModelMapper modelMapper;

    @Override
    public CarTypeResponse create(CreateCarTypeRequest request) {
        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        CarType entity = CarType.builder()
                .numberOfSeats(request.getNumberOfSeats())
                .carName(request.getCarName())
                .consumptionKwhPerKm(request.getConsumptionKwhPerKm())
                .price(request.getPrice())
                .carBrand(brand)
                .build();

        CarType saved = carTypeRepository.save(entity);
        return modelMapper.map(saved, CarTypeResponse.class);
    }

    @Override
    public CarTypeResponse getById(UUID typeId) {
        CarType entity = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + typeId));
        return modelMapper.map(entity, CarTypeResponse.class);
    }

    @Override
    public List<CarTypeResponse> getAll() {
        return carTypeRepository.findAll().stream()
                .map(ct -> modelMapper.map(ct, CarTypeResponse.class))
                .toList();
    }

    @Override
    public CarTypeResponse update(UUID typeId, CreateCarTypeRequest request) {
        CarType entity = carTypeRepository.findById(typeId)
                .orElseThrow(() -> new IllegalArgumentException("Car type not found: " + typeId));

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        entity.setNumberOfSeats(request.getNumberOfSeats());
        entity.setCarName(request.getCarName());
        entity.setConsumptionKwhPerKm(request.getConsumptionKwhPerKm());
        entity.setPrice(request.getPrice());
        entity.setCarBrand(brand);

        CarType saved = carTypeRepository.save(entity);
        return modelMapper.map(saved, CarTypeResponse.class);
    }

    @Override
    public void delete(UUID typeId) {
        if (!carTypeRepository.existsById(typeId)) {
            throw new IllegalArgumentException("Car type not found: " + typeId);
        }
        carTypeRepository.deleteById(typeId);
    }
}
