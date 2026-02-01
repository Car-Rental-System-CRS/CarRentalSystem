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

    public static CarBrand toEntity(CreateCarBrandRequest request) {
        if (request == null) return null;

        return CarBrand.builder()
                .name(request.getName())
                .build();
    }

    public static CarBrandResponse toResponse(CarBrand entity) {
        if (entity == null) return null;

        return CarBrandResponse.builder()
                .id(entity.getId())
                .name(entity.getName())
                .build();
    }
}
