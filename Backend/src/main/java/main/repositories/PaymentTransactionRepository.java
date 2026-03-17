package main.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.PaymentTransaction;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;

public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, UUID> {

    // Usage: Ensure 1 booking has only 1 BOOKING_PAYMENT
    Optional<PaymentTransaction> findByBookingIdAndPurpose(
            UUID bookingId,
            PaymentPurpose purpose
    );

    List<PaymentTransaction> findByBooking_Id(UUID bookingId);

       // Find the latest payment transaction for a booking by creation timestamp
       Optional<PaymentTransaction> findFirstByBooking_IdOrderByCreatedAtDesc(UUID bookingId);

    Optional<PaymentTransaction> findFirstByBooking_IdAndPurposeAndStatusOrderByCreatedAtDesc(
           UUID bookingId,
           PaymentPurpose purpose,
           PaymentStatus status
    );

    Optional<PaymentTransaction> findByPayOSPaymentCode(Long payOSPaymentCode);

    boolean existsByBookingIdAndPurpose(UUID bookingId, PaymentPurpose purpose);

    // Dashboard: revenue by month (PAID only) within date range
    @Query(value = "SELECT FORMAT(pt.created_at, 'yyyy-MM') AS month, SUM(pt.amount) AS revenue " +
           "FROM payment_transactions pt " +
           "WHERE pt.status = 'PAID' " +
           "AND pt.created_at >= :start AND pt.created_at <= :end " +
           "GROUP BY FORMAT(pt.created_at, 'yyyy-MM') " +
           "ORDER BY month", nativeQuery = true)
    List<Object[]> revenueByMonthBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    // Dashboard: payments grouped by status within date range
    @Query("SELECT pt.status AS status, COUNT(pt) AS cnt FROM PaymentTransaction pt " +
           "WHERE pt.createdAt >= :start AND pt.createdAt <= :end " +
           "GROUP BY pt.status")
    List<Object[]> countByStatusBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    // Dashboard: recent payments
    @Query("SELECT pt FROM PaymentTransaction pt JOIN FETCH pt.booking " +
           "WHERE pt.createdAt >= :start AND pt.createdAt <= :end " +
           "ORDER BY pt.createdAt DESC")
    List<PaymentTransaction> findRecentPayments(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);
}
