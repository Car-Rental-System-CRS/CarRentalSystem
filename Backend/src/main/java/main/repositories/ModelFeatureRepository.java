package main.repositories;

import main.entities.ModelFeature;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ModelFeatureRepository extends JpaRepository<ModelFeature, UUID> {

    Page<ModelFeature> findByCarTypeId(UUID typeId, Pageable pageable); //Find all features for one type

    Page<ModelFeature> findByCarFeatureId(UUID featureId, Pageable pageable); //Find all types with one feature

    boolean existsByCarTypeIdAndCarFeatureId(UUID typeId, UUID featureId); //Prevent duplicate mapping

    Optional<ModelFeature> findByCarTypeIdAndCarFeatureId(UUID typeId, UUID featureId); //Find one mapping

    @Modifying
    void deleteByCarTypeId(UUID typeId); //Bulk delete mappings

    @Modifying
    void deleteByCarTypeIdAndCarFeatureId(UUID typeId, UUID featureId); //Remove one feature from one type

}
