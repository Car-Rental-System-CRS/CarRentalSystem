package main.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.BookingCar;
import main.enums.BookingStatus;

public interface BookingCarRepository extends JpaRepository<BookingCar, UUID> {
    @Override
    Optional<BookingCar> findById(UUID id);

    List<BookingCar> findByBookingId(UUID bookingId);
    List<BookingCar> findByCarId(UUID carId);

    @Query("""
    SELECT DISTINCT bc.car.id
    FROM BookingCar bc
    JOIN bc.booking b
    WHERE bc.car.id IN :carIds
      AND b.status IN :blockingStatuses
      AND b.expectedReceiveDate < :returnDate
      AND b.expectedReturnDate > :receiveDate
    """)
    List<UUID> findUnavailableCarIds(
            @Param("carIds") List<UUID> carIds,
            @Param("receiveDate") LocalDateTime receiveDate,
            @Param("returnDate") LocalDateTime returnDate,
            @Param("blockingStatuses") List<BookingStatus> blockingStatuses
    );

    // Dashboard: top car types by booking count within date range
    @Query("SELECT bc.car.carType.name AS typeName, COUNT(bc) AS cnt " +
           "FROM BookingCar bc " +
           "WHERE bc.booking.createdAt >= :start AND bc.booking.createdAt <= :end " +
           "GROUP BY bc.car.carType.name " +
           "ORDER BY cnt DESC")
    List<Object[]> topCarTypesBetween(
            @Param("start") java.time.Instant start,
            @Param("end") java.time.Instant end
    );
}
