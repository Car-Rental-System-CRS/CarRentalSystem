package main.services;

import java.util.List;
import java.util.UUID;

import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import main.dtos.response.DiscountNotificationResponse;
import main.entities.DiscountCampaign;

public interface DiscountNotificationService {
    List<DiscountNotificationResponse> getNotificationsForAccount(UUID accountId);

    DiscountNotificationResponse markAsRead(UUID notificationId, UUID accountId);

    SseEmitter subscribe(UUID accountId);

    void publishCampaignNotifications(DiscountCampaign campaign);
}
