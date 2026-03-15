package main.mappers;

import lombok.AllArgsConstructor;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.PaymentTransaction;
import main.enums.PaymentMethod;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;

@Component
@AllArgsConstructor
public class PaymentTransactionMapper {
    public PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction paymentTransaction) {
    return PaymentTransactionResponse.builder()
        .id(paymentTransaction.getId())
        .bookingId(paymentTransaction.getBooking() != null ? paymentTransaction.getBooking().getId() : null)
        .amount(paymentTransaction.getAmount())
        .payOSPaymentCode(paymentTransaction.getPayOSPaymentCode())
        .paymentUrl(paymentTransaction.getPaymentUrl())
        .status(paymentTransaction.getStatus())
        .purpose(paymentTransaction.getPurpose())
        .paymentMethod(paymentTransaction.getPaymentMethod() != null
            ? paymentTransaction.getPaymentMethod()
            : PaymentMethod.PAYOS)
        .createdAt(paymentTransaction.getCreatedAt() != null
            ? LocalDateTime.ofInstant(paymentTransaction.getCreatedAt(), ZoneId.systemDefault())
            : null)
        .lastUpdatedAt(paymentTransaction.getModifiedAt() != null
            ? LocalDateTime.ofInstant(paymentTransaction.getModifiedAt(), ZoneId.systemDefault())
            : null)
        .build();
    }

    public List<PaymentTransactionResponse> toListPaymentTransactionResponse(
            List<PaymentTransaction> paymentTransactions
    ) {
        return paymentTransactions.stream()
            .map(this::toPaymentTransactionResponse)
                .toList();
    }

}
