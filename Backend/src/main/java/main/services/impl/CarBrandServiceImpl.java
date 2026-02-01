package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.entities.CarBrand;
import main.mappers.CarBrandMapper;
import main.repositories.CarBrandRepository;
import main.services.CarBrandService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarBrandServiceImpl implements CarBrandService {

    private final CarBrandRepository carBrandRepository;

    @Override
    public CarBrandResponse createBrand(CreateCarBrandRequest request) {

        CarBrand entity = CarBrandMapper.toEntity(request);

        CarBrand saved = carBrandRepository.save(entity);

        return CarBrandMapper.toResponse(saved);
    }

    @Override
    public CarBrandResponse getBrandById(UUID id) {
        CarBrand entity = carBrandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + id));

        return CarBrandMapper.toResponse(entity);
    }

    @Override
    public Page<CarBrandResponse> getAllBrands(
            Pageable pageable,
            Specification<CarBrand> specification
    ) {
        return carBrandRepository
                .findAll(specification, pageable)
                .map(CarBrandMapper::toResponse);
    }

    @Override
    public CarBrandResponse updateBrand(UUID id, CreateCarBrandRequest request) {
        CarBrand entity = carBrandRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + id));

        entity.setName(request.getName());

        CarBrand saved = carBrandRepository.save(entity);
        return CarBrandMapper.toResponse(saved);
    }

    @Override
    public void deleteBrand(UUID id) {
        if (!carBrandRepository.existsById(id)) {
            throw new IllegalArgumentException("Car brand not found: " + id);
        }
        carBrandRepository.deleteById(id);
    }

}
