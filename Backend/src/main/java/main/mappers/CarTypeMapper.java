package main.mappers;

import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;

public class CarTypeMapper {

    private CarTypeMapper() {}

    public static CarType toEntity(CreateCarTypeRequest request, CarBrand brand) {
        if (request == null) return null;

        return CarType.builder()
                .numberOfSeats(request.getNumberOfSeats())
                .name(request.getName())
                .consumptionKwhPerKm(request.getConsumptionKwhPerKm())
                .price(request.getPrice())
                .carBrand(brand)
                .build();
    }

    public static CarTypeResponse toResponse(CarType entity) {
        if (entity == null) return null;

        return CarTypeResponse.builder()
                .id(entity.getId())
                .numberOfSeats(entity.getNumberOfSeats())
                .name(entity.getName())
                .consumptionKwhPerKm(entity.getConsumptionKwhPerKm())
                .price(entity.getPrice())
                .carBrand(CarBrandMapper.toResponse(entity.getCarBrand()))
                .build();
    }
}
