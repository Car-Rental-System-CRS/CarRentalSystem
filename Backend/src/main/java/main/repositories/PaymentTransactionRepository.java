package main.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.PaymentTransaction;
import main.enums.PaymentPurpose;

public interface PaymentTransactionRepository
        extends JpaRepository<PaymentTransaction, UUID> {

    // Usage: Ensure 1 booking has only 1 BOOKING_PAYMENT
    Optional<PaymentTransaction> findByBookingIdAndPurpose(
            UUID bookingId,
            PaymentPurpose purpose
    );

    List<PaymentTransaction> findByBooking_Id(UUID bookingId);

    // Find the latest payment transaction for a booking
    Optional<PaymentTransaction> findFirstByBooking_IdOrderByIdDesc(UUID bookingId);

    Optional<PaymentTransaction> findByPayOSPaymentCode(Long payOSPaymentCode);

    boolean existsByBookingIdAndPurpose(UUID bookingId, PaymentPurpose purpose);

    // Dashboard: revenue by month (PAID only) within date range
    @Query(value = "SELECT FORMAT(b.created_at, 'yyyy-MM') AS month, SUM(pt.amount) AS revenue " +
           "FROM payment_transactions pt " +
           "JOIN bookings b ON pt.booking_id = b.id " +
           "WHERE pt.status = 'PAID' " +
           "AND b.created_at >= :start AND b.created_at <= :end " +
           "GROUP BY FORMAT(b.created_at, 'yyyy-MM') " +
           "ORDER BY month", nativeQuery = true)
    List<Object[]> revenueByMonthBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    // Dashboard: payments grouped by status within date range
    @Query("SELECT pt.status AS status, COUNT(pt) AS cnt FROM PaymentTransaction pt " +
           "WHERE pt.booking.createdAt >= :start AND pt.booking.createdAt <= :end " +
           "GROUP BY pt.status")
    List<Object[]> countByStatusBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);

    // Dashboard: recent payments
    @Query("SELECT pt FROM PaymentTransaction pt JOIN FETCH pt.booking " +
           "WHERE pt.booking.createdAt >= :start AND pt.booking.createdAt <= :end " +
           "ORDER BY pt.id DESC")
    List<PaymentTransaction> findRecentPayments(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);
}
