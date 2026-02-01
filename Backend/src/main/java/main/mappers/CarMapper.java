package main.mappers;

import main.dtos.request.CreateCarRequest;
import main.dtos.response.CarResponse;
import main.entities.Car;
import main.entities.CarType;

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

        return CarResponse.builder()
                .id(entity.getId())
                .licensePlate(entity.getLicensePlate())
                .importDate(entity.getImportDate())
                .typeId(
                        entity.getCarType() != null
                                ? entity.getCarType().getId()
                                : null
                )
                .build();
    }
}
