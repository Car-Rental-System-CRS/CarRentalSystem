package main.repositories;

import main.entities.CarFeature;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CarFeatureRepository extends JpaRepository<CarFeature, UUID> {
}
