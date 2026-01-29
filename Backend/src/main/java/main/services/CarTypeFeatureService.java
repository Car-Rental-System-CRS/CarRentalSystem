package main.services;

import main.entities.CarFeature;

import java.util.List;
import java.util.UUID;

public interface CarTypeFeatureService {
    List<CarFeature> getFeaturesByCarTypeId(UUID typeId);
    void replaceFeaturesForCarType(UUID typeId, List<UUID> featureId);
}
