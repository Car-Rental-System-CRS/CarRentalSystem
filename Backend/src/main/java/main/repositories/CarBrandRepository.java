package main.repositories;

import main.entities.CarBrand;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CarBrandRepository extends
        JpaRepository<CarBrand, UUID>,
        JpaSpecificationExecutor<CarBrand> {
}
