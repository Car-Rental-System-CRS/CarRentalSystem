package main.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.PaymentMethod;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentTransactionResponse {

    private UUID id;

    // 🔗 Booking reference
    private UUID bookingId;

    // 💰 Payment info
    private BigDecimal amount; // VND
    private long payOSPaymentCode;
    private String paymentUrl;

    private PaymentStatus status;
    private PaymentPurpose purpose;
    private PaymentMethod paymentMethod;

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;

}
