package main.mappers;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import main.entities.CarType;
import main.entities.MediaFile;

import java.util.List;
import java.util.stream.Collectors;

public class CarMapper {
    public static Car toEntity(CreateCarRequest request, CarType carType) {
        if (request == null) return null;

        return Car.builder()
                .licensePlate(request.getLicensePlate())
                .importDate(request.getImportDate())
                .carType(carType)
                .build();
    }

    public static CarResponse toResponse(Car entity) {
        if (entity == null) return null;

        CarType carType = entity.getCarType();
        String imageUrl = null;
        String brandName = null;
        
        if (carType != null) {
            // Get the first image URL from mediaFiles if available
            if (carType.getMediaFiles() != null && !carType.getMediaFiles().isEmpty()) {
                imageUrl = carType.getMediaFiles().stream()
                    .findFirst()
                    .map(MediaFile::getFileUrl)
                    .orElse(null);
            }
            
            // Get brand name
            if (carType.getCarBrand() != null) {
                brandName = carType.getCarBrand().getName();
            }
        }
        
        // Derive year from importDate if available
        Integer year = entity.getImportDate() != null 
            ? entity.getImportDate().getYear() 
            : null;

        return CarResponse.builder()
                .id(entity.getId())
                .licensePlate(entity.getLicensePlate())
                .importDate(entity.getImportDate())
                .typeId(carType != null ? carType.getId() : null)
                .name(carType != null ? carType.getName() : null)
                .brand(brandName)
                .model(carType != null ? carType.getName() : null)
                .year(year)
                .pricePerDay(carType != null ? carType.getPrice() : null)
                .quantity(1) // Single car instance
                .imageUrl(imageUrl)
                .build();
    }

    public static List<CarResponse> toResponseList(List<Car> entityList) {
        if(entityList == null) return null;
        return entityList.stream().map(CarMapper::toResponse).collect(Collectors.toList());
    }
}
