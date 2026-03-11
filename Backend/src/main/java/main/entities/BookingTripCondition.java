package main.entities;

import jakarta.persistence.*;
import lombok.*;
import main.enums.FuelLevel;
import main.enums.PostTripConfirmationStatus;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Stores the post-trip condition report submitted by staff after a vehicle is returned.
 * Kept separate from Booking to avoid bloating the Booking entity.
 */
@Entity
@Table(name = "booking_trip_conditions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingTripCondition {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    // One booking → one post-trip condition report
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking;

    // ─── Timestamps ───────────────────────────────────────────────────────────

    /** When staff pressed "record return" — vehicle physically arrived */
    @Column(name = "actual_return_timestamp")
    private LocalDateTime actualReturnTimestamp;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // ─── Condition fields (filled at upload-post-trip-condition step) ─────────

    @Column(name = "overall_condition_rating", precision = 2, scale = 1)
    private BigDecimal overallConditionRating;

    @Column(name = "odometer_reading")
    private Integer odometerReading;

    @Enumerated(EnumType.STRING)
    @Column(name = "fuel_level")
    private FuelLevel fuelLevel;

    @Column(name = "damage_notes", columnDefinition = "TEXT")
    private String damageNotes;

    // ─── Photos (stored as MediaFile records) ─────────────────────────────────
    @ElementCollection
    @CollectionTable(
            name = "booking_trip_condition_photos",
            joinColumns = @JoinColumn(name = "condition_id")
    )
    @Column(name = "photo_url", nullable = false)
    @Builder.Default
    private List<String> photoUrls = new ArrayList<>();
    // ─── Fee breakdown ────────────────────────────────────────────────────────

    /** Extra days × daily rate, calculated at return-timestamp step */
    @Column(name = "overdue_fee", precision = 15, scale = 2)
    private BigDecimal overdueFee;

    /** Assessed by staff based on condition rating + damage notes */
    @Column(name = "damage_fee", precision = 15, scale = 2)
    private BigDecimal damageFee;

    /** base + overdue + damage */
    @Column(name = "total_amount_due", precision = 15, scale = 2)
    private BigDecimal totalAmountDue;

    // ─── User confirmation ────────────────────────────────────────────────────

    @Enumerated(EnumType.STRING)
    @Column(name = "confirmation_status")
    private PostTripConfirmationStatus confirmationStatus;

    @Column(name = "dispute_reason", columnDefinition = "TEXT")
    private String disputeReason;
}