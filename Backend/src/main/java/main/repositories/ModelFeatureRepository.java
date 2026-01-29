package main.repositories;

import main.entities.ModelFeature;
import main.entities.ModelFeatureId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModelFeatureRepository extends JpaRepository<ModelFeature, ModelFeatureId> {
    List<ModelFeature> findByCarTypeIds(UUID carTypeId);
    void deleteByCarTypeId(UUID carTypeId);
}
