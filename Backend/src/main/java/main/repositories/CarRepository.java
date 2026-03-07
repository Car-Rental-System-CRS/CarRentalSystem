package main.repositories;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import main.entities.Car;

@Repository
public interface CarRepository extends
        JpaRepository<Car, UUID>,
        JpaSpecificationExecutor<Car> {
    
    List<Car> findByCarTypeId(UUID carTypeId);
}
