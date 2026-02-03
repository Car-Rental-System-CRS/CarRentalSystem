package main.repositories;

import main.entities.PaymentTransaction;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

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

}
