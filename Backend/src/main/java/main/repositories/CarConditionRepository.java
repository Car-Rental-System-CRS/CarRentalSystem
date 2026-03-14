package main.repositories;

import main.entities.CarCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface CarConditionRepository extends JpaRepository<CarCondition, UUID> {
    List<CarCondition> findByBookingId(UUID bookingId);
    boolean existsByCarId(UUID carId);
}