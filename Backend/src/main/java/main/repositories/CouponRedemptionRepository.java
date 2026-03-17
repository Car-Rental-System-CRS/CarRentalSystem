package main.repositories;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import main.entities.CouponRedemption;
import main.enums.CouponRedemptionStatus;

public interface CouponRedemptionRepository extends JpaRepository<CouponRedemption, UUID> {
    long countByCoupon_IdAndStatus(UUID couponId, CouponRedemptionStatus status);

    Optional<CouponRedemption> findByBooking_Id(UUID bookingId);
}
