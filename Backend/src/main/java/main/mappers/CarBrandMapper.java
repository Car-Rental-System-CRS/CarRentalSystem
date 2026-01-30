package main.mappers;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarBrandRequest;
import main.dtos.response.CarBrandResponse;
import main.entities.CarBrand;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CarBrandMapper {

    private final ModelMapper modelMapper;

    public CarBrand toEntity(CreateCarBrandRequest request) {
        CarBrand entity = new CarBrand();
        entity.setName(request.getBrandName());
        return entity;
    }

    public CarBrandResponse toResponse(CarBrand entity) {
        return modelMapper.map(entity, CarBrandResponse.class);
    }
}
