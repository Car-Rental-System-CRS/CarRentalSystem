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
        CarFeature entity = new CarFeature();
        entity.setName(request.getName());
        return entity;
    }

    public CarFeatureResponse toResponse(CarFeature entity) {
        return modelMapper.map(entity, CarFeatureResponse.class);
    }
}
