package main.repositories;

import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import main.entities.DiscountCampaign;
import main.enums.DiscountCampaignStatus;

public interface DiscountCampaignRepository extends JpaRepository<DiscountCampaign, UUID> {
    boolean existsByNameAndStatus(String name, DiscountCampaignStatus status);

    List<DiscountCampaign> findByStatusAndValidUntilBefore(DiscountCampaignStatus status, LocalDateTime validUntil);

    @Query("SELECT DISTINCT c FROM DiscountCampaign c " +
           "WHERE (c.validFrom <= :periodEnd AND c.validUntil >= :periodStart) " +
           "OR (c.createdAt >= :start AND c.createdAt <= :end)")
    List<DiscountCampaign> findRelevantCampaignsForPeriod(
            @Param("periodStart") LocalDateTime periodStart,
            @Param("periodEnd") LocalDateTime periodEnd,
            @Param("start") Instant start,
            @Param("end") Instant end
    );
}
