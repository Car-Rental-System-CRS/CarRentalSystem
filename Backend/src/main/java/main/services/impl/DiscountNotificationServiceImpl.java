package main.services.impl;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.dtos.response.DiscountNotificationResponse;
import main.dtos.response.DiscountNotificationStreamEventResponse;
import main.entities.Account;
import main.entities.Coupon;
import main.entities.DiscountCampaign;
import main.entities.DiscountNotification;
import main.enums.CouponStatus;
import main.enums.DiscountNotificationChannel;
import main.enums.DiscountNotificationDeliveryStatus;
import main.enums.DiscountNotificationReadStatus;
import main.enums.DiscountCampaignTargetingMode;
import main.mappers.DiscountCampaignMapper;
import main.repositories.AccountRepository;
import main.repositories.CouponRepository;
import main.repositories.DiscountNotificationRepository;
import main.services.DiscountNotificationService;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiscountNotificationServiceImpl implements DiscountNotificationService {

    private static final long SSE_TIMEOUT_MS = 60L * 60L * 1000L;

    private final DiscountNotificationRepository discountNotificationRepository;
    private final AccountRepository accountRepository;
    private final CouponRepository couponRepository;
    private final DiscountCampaignMapper discountCampaignMapper;
    private final JavaMailSender javaMailSender;

    private final Map<UUID, SseEmitter> emittersByAccount = new ConcurrentHashMap<>();

    @Value("${app.mail.from-address:}")
    private String fromAddress;

    @Override
    @Transactional(readOnly = true)
    public List<DiscountNotificationResponse> getNotificationsForAccount(UUID accountId) {
        long unreadCount = discountNotificationRepository.countByAccount_IdAndChannelAndReadStatus(
                accountId,
                DiscountNotificationChannel.IN_APP,
                DiscountNotificationReadStatus.UNREAD
        );
        return discountNotificationRepository.findByAccount_IdAndChannelOrderByCreatedAtDesc(accountId, DiscountNotificationChannel.IN_APP)
                .stream()
                .filter(notification -> !notification.getCampaign().getValidUntil().isBefore(LocalDateTime.now()))
                .map(notification -> discountCampaignMapper.toNotificationResponse(
                        notification,
                        unreadCount,
                        resolveCouponForAccount(notification.getCampaign(), accountId, notification.getCoupon())
                ))
                .toList();
    }

    @Override
    @Transactional
    public DiscountNotificationResponse markAsRead(UUID notificationId, UUID accountId) {
        DiscountNotification notification = discountNotificationRepository.findById(notificationId)
                .orElseThrow(() -> new IllegalArgumentException("Notification not found"));
        if (!notification.getAccount().getId().equals(accountId)) {
            throw new IllegalArgumentException("Notification does not belong to the authenticated user");
        }
        notification.setReadStatus(DiscountNotificationReadStatus.READ);
        notification.setReadAt(LocalDateTime.now());
        DiscountNotification saved = discountNotificationRepository.save(notification);
        long unreadCount = discountNotificationRepository.countByAccount_IdAndChannelAndReadStatus(
                accountId,
                DiscountNotificationChannel.IN_APP,
                DiscountNotificationReadStatus.UNREAD
        );
        return discountCampaignMapper.toNotificationResponse(
                saved,
                unreadCount,
                resolveCouponForAccount(saved.getCampaign(), accountId, saved.getCoupon())
        );
    }

    @Override
    public SseEmitter subscribe(UUID accountId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);
        SseEmitter previousEmitter = emittersByAccount.put(accountId, emitter);
        if (previousEmitter != null) {
            previousEmitter.complete();
        }

        emitter.onCompletion(() -> removeEmitter(accountId, emitter));
        emitter.onTimeout(() -> removeEmitter(accountId, emitter));
        emitter.onError(error -> removeEmitter(accountId, emitter));

        try {
            emitter.send(SseEmitter.event()
                    .name("connected")
                    .reconnectTime(5_000)
                    .data(DiscountNotificationStreamEventResponse.builder().type("connected").build()));
        } catch (IOException ex) {
            removeEmitter(accountId, emitter);
        }

        return emitter;
    }

    @Override
    @Transactional
    public void publishCampaignNotifications(DiscountCampaign campaign) {
        List<Account> recipients = resolveRecipients(campaign);
        List<Coupon> coupons = couponRepository.findByCampaign_Id(campaign.getId());

        for (Account account : recipients) {
            Coupon coupon = resolveCouponForAccount(campaign, account.getId(), null, coupons);

            DiscountNotification inApp = createNotification(campaign, account, coupon, DiscountNotificationChannel.IN_APP);
            DiscountNotification email = createNotification(campaign, account, coupon, DiscountNotificationChannel.EMAIL);

            sendEmail(email);
            pushInAppNotification(inApp);
        }
    }

    private DiscountNotification createNotification(DiscountCampaign campaign, Account account, Coupon coupon, DiscountNotificationChannel channel) {
        return discountNotificationRepository.findByCampaign_IdAndAccount_IdAndChannel(campaign.getId(), account.getId(), channel)
                .map(existing -> updateNotification(existing, account, coupon))
                .orElseGet(() -> discountNotificationRepository.save(DiscountNotification.builder()
                        .campaign(campaign)
                        .account(account)
                        .coupon(coupon)
                        .channel(channel)
                        .deliveryStatus(DiscountNotificationDeliveryStatus.PENDING)
                        .readStatus(DiscountNotificationReadStatus.UNREAD)
                        .recipientEmail(account.getEmail())
                        .build()));
    }

    private void sendEmail(DiscountNotification notification) {
        if (notification.getDeliveryStatus() == DiscountNotificationDeliveryStatus.SENT && notification.getSentAt() != null) {
            return;
        }

        if (!StringUtils.hasText(notification.getRecipientEmail())) {
            notification.setDeliveryStatus(DiscountNotificationDeliveryStatus.SKIPPED);
            notification.setFailureReason("Recipient email is missing");
            discountNotificationRepository.save(notification);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(notification.getRecipientEmail());
        if (StringUtils.hasText(fromAddress)) {
            message.setFrom(fromAddress);
        }
        String couponCode = notification.getCoupon() != null ? notification.getCoupon().getCode() : "promotion details";
        message.setSubject("New discount campaign: " + notification.getCampaign().getName());
        message.setText("""
                Hello,

                A new discount campaign is available for your account.

                Campaign: %s
                Offer: %s
                Coupon: %s
                Valid until: %s
                """.formatted(
                notification.getCampaign().getName(),
                notification.getCampaign().getDescription(),
                couponCode,
                notification.getCampaign().getValidUntil()
        ));

        try {
            javaMailSender.send(message);
            notification.setDeliveryStatus(DiscountNotificationDeliveryStatus.SENT);
            notification.setSentAt(LocalDateTime.now());
            notification.setFailureReason(null);
        } catch (MailException | IllegalStateException ex) {
            log.warn("Failed to send promotion email for campaign {} to {}: {}", notification.getCampaign().getId(), notification.getRecipientEmail(), ex.getMessage());
            notification.setDeliveryStatus(DiscountNotificationDeliveryStatus.FAILED);
            notification.setFailureReason(ex.getMessage());
        }
        discountNotificationRepository.save(notification);
    }

    private void pushInAppNotification(DiscountNotification notification) {
        notification.setDeliveryStatus(DiscountNotificationDeliveryStatus.SENT);
        notification.setSentAt(LocalDateTime.now());
        DiscountNotification saved = discountNotificationRepository.save(notification);
        long unreadCount = discountNotificationRepository.countByAccount_IdAndChannelAndReadStatus(
                saved.getAccount().getId(),
                DiscountNotificationChannel.IN_APP,
                DiscountNotificationReadStatus.UNREAD
        );
        Coupon resolvedCoupon = resolveCouponForAccount(saved.getCampaign(), saved.getAccount().getId(), saved.getCoupon());
        if (!sameCoupon(saved.getCoupon(), resolvedCoupon)) {
            saved.setCoupon(resolvedCoupon);
            saved = discountNotificationRepository.save(saved);
        }

        DiscountNotificationResponse response = discountCampaignMapper.toNotificationResponse(saved, unreadCount, resolvedCoupon);
        DiscountNotificationStreamEventResponse event = DiscountNotificationStreamEventResponse.builder()
                .type("notification")
                .notification(response)
                .build();

        SseEmitter emitter = emittersByAccount.get(saved.getAccount().getId());
        if (emitter == null) {
            return;
        }

        try {
            emitter.send(SseEmitter.event().name("discount-notification").data(event));
        } catch (IOException ex) {
            removeEmitter(saved.getAccount().getId(), emitter);
        }
    }

    private DiscountNotification updateNotification(DiscountNotification notification, Account account, Coupon coupon) {
        boolean changed = false;

        if (!sameCoupon(notification.getCoupon(), coupon)) {
            notification.setCoupon(coupon);
            if (notification.getChannel() == DiscountNotificationChannel.IN_APP) {
                notification.setReadStatus(DiscountNotificationReadStatus.UNREAD);
                notification.setReadAt(null);
            }
            changed = true;
        }

        if (!account.getEmail().equals(notification.getRecipientEmail())) {
            notification.setRecipientEmail(account.getEmail());
            changed = true;
        }

        return changed ? discountNotificationRepository.save(notification) : notification;
    }

    private List<Account> resolveRecipients(DiscountCampaign campaign) {
        if (campaign.getTargetingMode() == DiscountCampaignTargetingMode.FILTERED_RENTERS && StringUtils.hasText(campaign.getTargetAccountIdsCsv())) {
            List<UUID> targetIds = Arrays.stream(campaign.getTargetAccountIdsCsv().split(","))
                    .filter(value -> !value.isBlank())
                    .map(UUID::fromString)
                    .toList();
            return accountRepository.findAllById(targetIds);
        }
        return accountRepository.findByRole(main.enums.Role.USER);
    }

    private Coupon resolveCouponForAccount(DiscountCampaign campaign, UUID accountId, Coupon preferredCoupon) {
        return resolveCouponForAccount(campaign, accountId, preferredCoupon, couponRepository.findByCampaign_Id(campaign.getId()));
    }

    private Coupon resolveCouponForAccount(DiscountCampaign campaign, UUID accountId, Coupon preferredCoupon, List<Coupon> campaignCoupons) {
        if (isCouponUsableForAccount(preferredCoupon, campaign, accountId)) {
            return preferredCoupon;
        }

        return campaignCoupons.stream()
                .filter(coupon -> isCouponUsableForAccount(coupon, campaign, accountId))
                .sorted(Comparator
                        .comparing((Coupon coupon) -> !isAssignedToAccount(coupon, accountId))
                        .thenComparing(Coupon::getUsageCount)
                        .thenComparing(Coupon::getCreatedAt))
                .findFirst()
                .orElse(null);
    }

    private boolean isCouponUsableForAccount(Coupon coupon, DiscountCampaign campaign, UUID accountId) {
        if (coupon == null || coupon.getCampaign() == null || !coupon.getCampaign().getId().equals(campaign.getId())) {
            return false;
        }
        if (coupon.getStatus() == CouponStatus.EXPIRED
                || coupon.getStatus() == CouponStatus.CANCELLED
                || coupon.getStatus() == CouponStatus.REDEEMED) {
            return false;
        }
        if (coupon.getUsageCount() >= coupon.getUsageLimit()) {
            return false;
        }
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            return false;
        }
        return coupon.getEligibleAccount() == null || coupon.getEligibleAccount().getId().equals(accountId);
    }

    private boolean isAssignedToAccount(Coupon coupon, UUID accountId) {
        return coupon.getEligibleAccount() != null && coupon.getEligibleAccount().getId().equals(accountId);
    }

    private boolean sameCoupon(Coupon left, Coupon right) {
        if (left == null || right == null) {
            return left == right;
        }
        return left.getId() != null && left.getId().equals(right.getId());
    }

    private void removeEmitter(UUID accountId, SseEmitter emitter) {
        SseEmitter currentEmitter = emittersByAccount.get(accountId);
        if (currentEmitter == emitter) {
            emittersByAccount.remove(accountId);
        }
    }
}
