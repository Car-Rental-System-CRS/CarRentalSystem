package main.mappers;

import main.dtos.response.ModelFeatureResponse;
import main.entities.CarFeature;
import main.entities.CarType;
import main.entities.ModelFeature;

public class ModelFeatureMapper {
    public static ModelFeature toEntity(CarType type, CarFeature feature) {
        return ModelFeature.builder()
                .carType(type)
                .carFeature(feature)
                .build();
    }

    public static ModelFeatureResponse toResponse(ModelFeature entity) {
        return ModelFeatureResponse.builder()
                .id(entity.getId())
                .typeId(entity.getCarType().getId())
                .featureId(entity.getCarFeature().getId())
                .build();
    }
}
