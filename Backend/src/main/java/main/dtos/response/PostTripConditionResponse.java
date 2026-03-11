package main.dtos.response;

import lombok.Builder;
import lombok.Data;
import main.enums.BookingStatus;
import main.enums.PostTripConfirmationStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@Builder
public class PostTripConditionResponse {

    private UUID bookingId;
    private UUID conditionReportId;

    // ─── Return timing ────────────────────────────────────────────────────────
    private LocalDateTime actualReturnTimestamp;
    private LocalDateTime expectedReturnDate;

    // ─── Condition fields ─────────────────────────────────────────────────────
    private BigDecimal overallConditionRating;
    private Integer odometerReading;
    private String fuelLevel;
    private String damageNotes;

    // ─── Photos ───────────────────────────────────────────────────────────────
    /** Relative URLs e.g. /uploads/post-trip/{bookingId}/filename.jpg */
    private List<String> photoUrls;

    // ─── Fee breakdown ────────────────────────────────────────────────────────
    private BigDecimal baseRentalFee;   // booking.bookingPrice
    private BigDecimal overdueFee;
    private BigDecimal damageFee;
    private BigDecimal totalAmountDue;

    // ─── Status ───────────────────────────────────────────────────────────────
    private BookingStatus bookingStatus;
    private PostTripConfirmationStatus postTripConfirmationStatus;
    private String disputeReason;

    // ─── Payment (QR path only) ───────────────────────────────────────────────
    /** PayOS checkout URL — only present after user ACCEPTs and QR payment is created */
    private String paymentUrl;
}