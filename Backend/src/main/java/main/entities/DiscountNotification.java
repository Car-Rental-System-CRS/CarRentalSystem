package main.entities;

import java.time.LocalDateTime;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.DiscountNotificationChannel;
import main.enums.DiscountNotificationDeliveryStatus;
import main.enums.DiscountNotificationReadStatus;

@Entity
@Table(
        name = "discount_notifications",
        uniqueConstraints = @UniqueConstraint(columnNames = {"campaign_id", "account_id", "channel"})
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiscountNotification extends AuditableEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "campaign_id", nullable = false)
    private DiscountCampaign campaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false)
    private Account account;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "coupon_id")
    private Coupon coupon;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountNotificationChannel channel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountNotificationDeliveryStatus deliveryStatus;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private DiscountNotificationReadStatus readStatus;

    @Column(length = 255)
    private String recipientEmail;

    private LocalDateTime sentAt;

    private LocalDateTime readAt;

    @Column(length = 1000)
    private String failureReason;
}
