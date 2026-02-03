package main.repositories;

import main.entities.BookingCar;
import main.enums.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingCarRepository extends JpaRepository<BookingCar, UUID> {
    Optional<BookingCar> findById(UUID id);

    List<BookingCar> findByBookingId(UUID bookingId);
    List<BookingCar> findByCarId(UUID carId);

    @Query("""
    SELECT DISTINCT bc.car.id
    FROM BookingCar bc
    JOIN bc.booking b
    WHERE bc.car.id IN :carIds
      AND b.status IN :blockingStatuses
      AND (
            (
                b.expectedReceiveDate > :receiveDate
                AND b.expectedReturnDate < :returnDate
            )
            OR (
                b.expectedReceiveDate <: returnDate
                AND b.expectedReturnDate > : receiveDate
            )
      )
    """)
    List<UUID> findUnavailableCarIds(
            @Param("carIds") List<UUID> carIds,
            @Param("receiveDate") LocalDate receiveDate,
            @Param("returnDate") LocalDate returnDate,
            @Param("blockingStatuses") List<BookingStatus> blockingStatuses
    );


}
