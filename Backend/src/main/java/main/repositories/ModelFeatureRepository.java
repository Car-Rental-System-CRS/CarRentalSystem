package main.repositories;

import main.entities.ModelFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModelFeatureRepository extends JpaRepository<ModelFeature, UUID> {

    List<ModelFeature> findByCarTypeId(UUID carTypeId); //Find all features for one type

    List<ModelFeature> findByCarFeatureId(UUID carFeatureId); //Find all types with one feature

    boolean existsByCarTypeIdAndCarFeatureId(UUID carTypeId, UUID carFeatureId); //Prevent duplicate mapping

    Optional<ModelFeature> findByCarTypeIdAndCarFeatureId(UUID carTypeId, UUID carFeatureId); //Find one mapping

    void deleteByCarTypeId(UUID carTypeId); //Bulk delete mappings

    void deleteByCarTypeIdAndCarFeatureId(UUID carTypeId, UUID carFeatureId); //Remove one feature from one type

}
