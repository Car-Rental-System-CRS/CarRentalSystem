package main.repositories;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.Booking;
import main.enums.BookingStatus;

public interface BookingRepository extends JpaRepository<Booking, UUID>, JpaSpecificationExecutor<Booking> {
    Optional<Booking> findById(UUID id);
    
    List<Booking> findByAccountIdOrderByCreatedAtDesc(UUID accountId);

    // Dashboard: bookings grouped by status within date range
    @Query("SELECT b.status AS status, COUNT(b) AS cnt FROM Booking b " +
           "WHERE b.createdAt >= :start AND b.createdAt <= :end " +
           "GROUP BY b.status")
    List<Object[]> countByStatusBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Dashboard: bookings grouped by month within date range
    @Query(value = "SELECT FORMAT(b.created_at, 'yyyy-MM') AS month, COUNT(*) AS cnt " +
           "FROM bookings b " +
           "WHERE b.created_at >= :start AND b.created_at <= :end " +
           "GROUP BY FORMAT(b.created_at, 'yyyy-MM') " +
           "ORDER BY month", nativeQuery = true)
    List<Object[]> countByMonthBetween(@Param("start") Instant start, @Param("end") Instant end);

    // Dashboard: recent bookings
    @Query("SELECT b FROM Booking b JOIN FETCH b.account " +
           "WHERE b.createdAt >= :start AND b.createdAt <= :end " +
           "ORDER BY b.createdAt DESC")
    List<Booking> findRecentBookings(@Param("start") Instant start, @Param("end") Instant end);

    // Find CONFIRMED bookings whose expected pickup date is before the given cutoff
    @Query("SELECT b FROM Booking b WHERE b.status = main.enums.BookingStatus.CONFIRMED " +
           "AND b.expectedReceiveDate < :cutoff")
    List<Booking> findConfirmedBookingsBeforePickupCutoff(@Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT b FROM Booking b WHERE b.status = :status " +
           "AND b.actualReturnDate IS NULL AND b.expectedReturnDate < :cutoff")
    List<Booking> findBookingsByStatusBeforeReturnCutoff(
            @Param("status") BookingStatus status,
            @Param("cutoff") LocalDateTime cutoff
    );
}
