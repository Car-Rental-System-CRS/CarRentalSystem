package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.entities.CarBrand;
import main.repositories.CarBrandRepository;
import main.services.CarBrandService;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarBrandServiceImpl implements CarBrandService {

    private final CarBrandRepository carBrandRepository;
    private final ModelMapper modelMapper;

    @Override
    public CarBrandResponse create(CreateCarBrandRequest request) {
        CarBrand entity = CarBrand.builder()
                .brandName(request.getBrandName())
                .build();

        CarBrand saved = carBrandRepository.save(entity);
        return modelMapper.map(saved, CarBrandResponse.class);
    }

    @Override
    public CarBrandResponse getById(UUID brandId) {
        CarBrand entity = carBrandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + brandId));
        return modelMapper.map(entity, CarBrandResponse.class);
    }

    @Override
    public List<CarBrandResponse> getAll() {
        return carBrandRepository.findAll().stream()
                .map(e -> modelMapper.map(e, CarBrandResponse.class))
                .toList();
    }

    @Override
    public CarBrandResponse update(UUID brandId, CreateCarBrandRequest request) {
        CarBrand entity = carBrandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + brandId));

        entity.setBrandName(request.getBrandName());

        CarBrand saved = carBrandRepository.save(entity);
        return modelMapper.map(saved, CarBrandResponse.class);
    }

    @Override
    public void delete(UUID brandId) {
        if (!carBrandRepository.existsById(brandId)) {
            throw new IllegalArgumentException("Car brand not found: " + brandId);
        }
        carBrandRepository.deleteById(brandId);
    }
}
