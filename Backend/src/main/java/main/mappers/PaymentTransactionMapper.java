package main.mappers;

import lombok.AllArgsConstructor;
import main.dtos.response.PaymentTransactionResponse;
import main.entities.PaymentTransaction;
import org.modelmapper.ModelMapper;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@AllArgsConstructor
public class PaymentTransactionMapper {
    private final ModelMapper mapper;

    public PaymentTransactionResponse toPaymentTransactionResponse(PaymentTransaction paymentTransaction) {
        return mapper.map(paymentTransaction, PaymentTransactionResponse.class);
    }

    public List<PaymentTransactionResponse> toListPaymentTransactionResponse(
            List<PaymentTransaction> paymentTransactions
    ) {
        return paymentTransactions.stream()
                .map(p -> mapper.map(p, PaymentTransactionResponse.class))
                .toList();
    }

}
