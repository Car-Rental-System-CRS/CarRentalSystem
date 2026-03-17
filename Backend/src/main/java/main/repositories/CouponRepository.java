package main.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.Coupon;
import main.enums.CouponStatus;

public interface CouponRepository extends JpaRepository<Coupon, UUID> {
    Optional<Coupon> findByCode(String code);

    boolean existsByCode(String code);

    List<Coupon> findByCampaign_Id(UUID campaignId);

    @Query("SELECT c FROM Coupon c WHERE c.campaign.id = :campaignId AND c.status = :status")
    List<Coupon> findByCampaignIdAndStatus(@Param("campaignId") UUID campaignId, @Param("status") CouponStatus status);

    @Query("SELECT c FROM Coupon c WHERE c.status = :status AND c.expiresAt < :cutoff")
    List<Coupon> findExpiredCoupons(@Param("status") CouponStatus status, @Param("cutoff") LocalDateTime cutoff);

    @Query("SELECT c FROM Coupon c JOIN FETCH c.campaign " +
           "WHERE c.createdAt >= :start AND c.createdAt <= :end")
    List<Coupon> findWithCampaignByCreatedAtBetween(@Param("start") java.time.Instant start, @Param("end") java.time.Instant end);
}
