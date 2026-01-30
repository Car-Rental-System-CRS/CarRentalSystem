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

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarBrandServiceImpl implements CarBrandService {

    private final CarBrandRepository carBrandRepository;
    private final CarBrandMapper carBrandMapper;

    @Override
    public CarBrandResponse createBrand(CreateCarBrandRequest request) {
        CarBrand entity = carBrandMapper.toEntity(request);

        CarBrand saved = carBrandRepository.save(entity);
        return carBrandMapper.toResponse(saved);
    }

    @Override
    public CarBrandResponse getBrandById(UUID brandId) {
        CarBrand entity = carBrandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + brandId));

        return carBrandMapper.toResponse(entity);
    }

    @Override
    public Page<CarBrandResponse> getAllBrands(
            Pageable pageable,
            Specification<CarBrand> specification
    ) {
        return carBrandRepository
                .findAll(specification, pageable)
                .map(carBrandMapper::toResponse);
    }

    @Override
    public CarBrandResponse updateBrand(UUID brandId, CreateCarBrandRequest request) {
        CarBrand entity = carBrandRepository.findById(brandId)
                .orElseThrow(() -> new IllegalArgumentException("Car brand not found: " + brandId));

        entity.setName(request.getBrandName());

        CarBrand saved = carBrandRepository.save(entity);
        return carBrandMapper.toResponse(saved);
    }

    @Override
    public void deleteBrand(UUID brandId) {
        if (!carBrandRepository.existsById(brandId)) {
            throw new IllegalArgumentException("Car brand not found: " + brandId);
        }
        carBrandRepository.deleteById(brandId);
    }

}
