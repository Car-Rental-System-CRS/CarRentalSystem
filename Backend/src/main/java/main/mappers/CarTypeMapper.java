package main.mappers;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarTypeRequest;
import main.dtos.response.CarTypeResponse;
import main.entities.CarBrand;
import main.entities.CarType;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CarTypeMapper {

    public static CarType toEntity(CreateCarTypeRequest request, CarBrand brand) {
        return CarType.builder()
                .numberOfSeats(request.getNumberOfSeats())
                .carName(request.getCarName())
                .consumptionKwhPerKm(request.getConsumptionKwhPerKm())
                .price(request.getPrice())
                .carBrand(brand)
                .build();
    }

    public static CarTypeResponse toResponse(CarType entity) {
        return CarTypeResponse.builder()
                .id(entity.getId())
                .numberOfSeats(entity.getNumberOfSeats())
                .carName(entity.getCarName())
                .consumptionKwhPerKm(entity.getConsumptionKwhPerKm())
                .price(entity.getPrice())
                .carBrand(CarBrandMapper.toResponse(entity.getCarBrand()))
                .build();
    }
}
