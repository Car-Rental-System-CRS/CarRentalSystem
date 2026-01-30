package main.repositories;

import main.entities.CarType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface CarTypeRepository extends
        JpaRepository<CarType, UUID>,
        JpaSpecificationExecutor<CarType> {
}
