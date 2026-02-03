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

    Page<ModelFeature> findByCarType_Id(UUID typeId, Pageable pageable);

    Page<ModelFeature> findByCarFeature_Id(UUID featureId, Pageable pageable);

    boolean existsByCarType_IdAndCarFeature_Id(UUID typeId, UUID featureId);

    Optional<ModelFeature> findByCarType_IdAndCarFeature_Id(UUID typeId, UUID featureId);

}
