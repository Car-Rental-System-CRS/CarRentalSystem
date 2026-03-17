package main.controllers;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.response.DiscountNotificationResponse;
import main.security.CustomUserDetails;
import main.services.DiscountNotificationService;

@RestController
@RequestMapping("/api/discount-notifications")
@RequiredArgsConstructor
public class DiscountNotificationController {

    private final DiscountNotificationService discountNotificationService;

    @GetMapping
    public ResponseEntity<APIResponse<List<DiscountNotificationResponse>>> getNotifications(
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(APIResponse.<List<DiscountNotificationResponse>>builder()
                .success(true)
                .message("OK")
                .data(discountNotificationService.getNotificationsForAccount(userDetails.getAccountId()))
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<APIResponse<DiscountNotificationResponse>> markAsRead(
            @PathVariable UUID notificationId,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return ResponseEntity.ok(APIResponse.<DiscountNotificationResponse>builder()
                .success(true)
                .message("Notification marked as read")
                .data(discountNotificationService.markAsRead(notificationId, userDetails.getAccountId()))
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping(path = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamNotifications(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return discountNotificationService.subscribe(userDetails.getAccountId());
    }
}
