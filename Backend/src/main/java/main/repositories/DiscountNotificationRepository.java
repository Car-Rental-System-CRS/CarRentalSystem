package main.repositories;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import main.entities.DiscountNotification;
import main.enums.DiscountNotificationChannel;
import main.enums.DiscountNotificationReadStatus;

public interface DiscountNotificationRepository extends JpaRepository<DiscountNotification, UUID> {
    List<DiscountNotification> findByAccount_IdAndChannelOrderByCreatedAtDesc(UUID accountId, DiscountNotificationChannel channel);

    long countByAccount_IdAndChannelAndReadStatus(UUID accountId, DiscountNotificationChannel channel, DiscountNotificationReadStatus readStatus);

    Optional<DiscountNotification> findByCampaign_IdAndAccount_IdAndChannel(UUID campaignId, UUID accountId, DiscountNotificationChannel channel);
}
