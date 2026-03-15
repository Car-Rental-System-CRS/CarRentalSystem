package main.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import main.entities.PostTripInspection;

public interface PostTripInspectionRepository extends JpaRepository<PostTripInspection, UUID> {
    Optional<PostTripInspection> findByBookingId(UUID bookingId);
}
