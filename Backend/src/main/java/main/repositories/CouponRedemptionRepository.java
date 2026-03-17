package main.repositories;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.CouponRedemption;
import main.enums.CouponRedemptionStatus;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    long countByCoupon_IdAndStatus(UUID couponId, CouponRedemptionStatus status);

    Optional<CouponRedemption> findByBooking_Id(UUID bookingId);

    @Query("SELECT cr FROM CouponRedemption cr " +
           "JOIN FETCH cr.campaign " +
           "LEFT JOIN FETCH cr.booking " +
           "WHERE cr.createdAt >= :start AND cr.createdAt <= :end")
    List<CouponRedemption> findWithCampaignAndBookingByCreatedAtBetween(
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
