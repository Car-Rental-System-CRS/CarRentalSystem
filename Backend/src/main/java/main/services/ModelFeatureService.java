package main.services;

import main.dtos.response.ModelFeatureResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

public interface ModelFeatureService {

    void attachFeatureToType(UUID typeId, UUID featureId);

    void removeFeatureFromType(UUID typeId, UUID featureId);

    void attachFeaturesBulk(UUID typeId, List<UUID> featureIds);

    void replaceFeatures(UUID typeId, List<UUID> featureIds);

    void detachFeaturesBulk(UUID typeId, List<UUID> featureIds);


    Page<ModelFeatureResponse> getByType(UUID typeId, Pageable pageable);

    Page<ModelFeatureResponse> getByFeature(UUID featureId, Pageable pageable);

}
