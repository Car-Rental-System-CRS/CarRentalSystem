package main.repositories;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import main.entities.DiscountCampaign;
import main.enums.DiscountCampaignStatus;

public interface DiscountCampaignRepository extends JpaRepository<DiscountCampaign, UUID> {
    boolean existsByNameAndStatus(String name, DiscountCampaignStatus status);

    List<DiscountCampaign> findByStatusAndValidUntilBefore(DiscountCampaignStatus status, LocalDateTime validUntil);
}
