package main.repositories;

import main.entities.BookingTripCondition;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookingTripConditionRepository extends JpaRepository<BookingTripCondition, UUID> {

    Optional<BookingTripCondition> findByBookingId(UUID bookingId);

    boolean existsByBookingId(UUID bookingId);
}