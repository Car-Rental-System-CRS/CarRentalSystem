package main.mappers;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import main.entities.ModelFeature;

import java.util.Collections;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class CarTypeMapper {

    private final CarBrandMapper carBrandMapper;
    private final CarFeatureMapper carFeatureMapper;


    public CarType toEntity(CreateCarTypeRequest request, CarBrand brand) {
        if (request == null) return null;

        return CarType.builder()
                .numberOfSeats(request.getNumberOfSeats())
                .name(request.getName())
                .consumptionKwhPerKm(request.getConsumptionKwhPerKm())
                .price(request.getPrice())
                .description(request.getDescription())
                .carBrand(brand)
                .build();
    }

    public CarTypeResponse toResponse(CarType entity) {
        if (entity == null) return null;

        return CarTypeResponse.builder()
                .id(entity.getId())
                .numberOfSeats(entity.getNumberOfSeats())
                .name(entity.getName())
                .consumptionKwhPerKm(entity.getConsumptionKwhPerKm())
                .price(entity.getPrice())
                .description(entity.getDescription())
                .carQuantity(entity.getCars() != null ? entity.getCars().size() : 0)
                .carBrand(carBrandMapper.toResponse(entity.getCarBrand()))
                .mediaFiles(entity.getMediaFiles() != null 
                        ? entity.getMediaFiles().stream()
                                .map(MediaFileMapper::toResponse)
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
    
    public CarTypeResponse toResponseWithFeatures(CarType entity, java.util.List<ModelFeature> modelFeatures) {
        if (entity == null) return null;

        return CarTypeResponse.builder()
                .id(entity.getId())
                .numberOfSeats(entity.getNumberOfSeats())
                .name(entity.getName())
                .consumptionKwhPerKm(entity.getConsumptionKwhPerKm())
                .price(entity.getPrice())
                .description(entity.getDescription())
                .carQuantity(entity.getCars() != null ? entity.getCars().size() : 0)
                .carBrand(carBrandMapper.toResponse(entity.getCarBrand()))
                .mediaFiles(entity.getMediaFiles() != null 
                        ? entity.getMediaFiles().stream()
                                .map(MediaFileMapper::toResponse)
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .features(modelFeatures != null
                        ? modelFeatures.stream()
                                .map(mf -> carFeatureMapper.toResponse(mf.getCarFeature()))
                                .collect(Collectors.toList())
                        : Collections.emptyList())
                .build();
    }
}
