package main.services.payos.impl;

import lombok.RequiredArgsConstructor;
import main.services.payos.PayosService;
import org.springframework.stereotype.Service;
import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.v2.paymentRequests.PaymentLinkItem;

@Service
@RequiredArgsConstructor
public class PayosServiceImpl implements PayosService {

    private final PayOS payOS;

    @Override
    public String createPaymentLink(long payosPaymentCode, long amount) {

        try {
            CreatePaymentLinkRequest request =
                    CreatePaymentLinkRequest.builder()
                            .orderCode(payosPaymentCode) // VERY IMPORTANT
                            .amount(amount)
                            .description("Car rental payment")
                            .returnUrl("http://localhost:8080/payment/success")
                            .cancelUrl("http://localhost:8080/payment/cancel")
                            .item(
                                    PaymentLinkItem.builder()
                                            .name("Car rental")
                                            .price(amount)
                                            .quantity(1)
                                            .build()
                            )
                            .build();

            CreatePaymentLinkResponse response =
                    payOS.paymentRequests().create(request);

            return response.getCheckoutUrl();

        } catch (Exception e) {
            throw new RuntimeException("Create PayOS payment failed", e);
        }
    }
}
