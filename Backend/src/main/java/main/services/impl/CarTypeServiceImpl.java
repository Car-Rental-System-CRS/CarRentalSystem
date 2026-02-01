package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.mappers.CarTypeMapper;
import main.repositories.CarBrandRepository;
import main.repositories.CarTypeRepository;
import main.services.CarTypeService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CarTypeServiceImpl implements CarTypeService {
    private final CarTypeRepository carTypeRepository;
    private final CarBrandRepository carBrandRepository;

    @Override
    public CarTypeResponse createType(CreateCarTypeRequest request) {

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        CarType entity = CarTypeMapper.toEntity(request, brand);

        CarType saved = carTypeRepository.save(entity);

        return CarTypeMapper.toResponse(saved);
    }

    @Override
    public CarTypeResponse getTypeById(UUID id) {

        CarType entity = carTypeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + id));

        return CarTypeMapper.toResponse(entity);
    }

    @Override
    public Page<CarTypeResponse> getAllTypes(
            Pageable pageable,
            Specification<CarType> specification
    ) {
        return carTypeRepository
                .findAll(specification, pageable)
                .map(CarTypeMapper::toResponse);
    }


    @Override
    public CarTypeResponse updateType(UUID id, CreateCarTypeRequest request) {

        CarType entity = carTypeRepository.findById(id)
                .orElseThrow(() ->
                        new IllegalArgumentException("Car type not found: " + id));

        CarBrand brand = carBrandRepository.findById(request.getBrandId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Car brand not found: " + request.getBrandId()));

        // Update fields manually (or later move to mapper helper)
        entity.setNumberOfSeats(request.getNumberOfSeats());
        entity.setName(request.getName());
        entity.setConsumptionKwhPerKm(request.getConsumptionKwhPerKm());
        entity.setPrice(request.getPrice());

        CarType saved = carTypeRepository.save(entity);

        return CarTypeMapper.toResponse(saved);
    }

    @Override
    public void deleteType(UUID id) {

        if (!carTypeRepository.existsById(id)) {
            throw new IllegalArgumentException("Car type not found: " + id);
        }

        carTypeRepository.deleteById(id);
    }
}
