package main.dtos.response;

import lombok.*;
import main.enums.PaymentPurpose;
import main.enums.PaymentStatus;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

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

    private LocalDateTime createdAt;
    private LocalDateTime lastUpdatedAt;

}
