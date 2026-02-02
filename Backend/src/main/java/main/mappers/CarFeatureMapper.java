package main.mappers;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCarFeatureRequest;
import main.dtos.response.CarFeatureResponse;
import main.entities.CarFeature;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class CarFeatureMapper {

    private final ModelMapper modelMapper;

    public CarFeature toEntity(CreateCarFeatureRequest request) {
        return CarFeature.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
    }


    public CarFeatureResponse toResponse(CarFeature entity) {
        if (entity == null) return null;
        return modelMapper.map(entity, CarFeatureResponse.class);
    }
}
