package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.entities.PaymentTransaction;
import main.enums.BookingStatus;
import main.enums.PaymentStatus;
import main.repositories.PaymentTransactionRepository;
import main.services.PayosService;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.RequestBody;

import vn.payos.PayOS;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkRequest;
import vn.payos.model.v2.paymentRequests.CreatePaymentLinkResponse;
import vn.payos.model.webhooks.Webhook;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PayosServiceImpl implements PayosService {

    private final PayOS payOS;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Value("${app.frontend.base-url}")
    private String frontendBaseUrl;

    @Value("${app.payment.success-path}")
    private String successPath;

    @Value("${app.payment.cancel-path}")
    private String cancelPath;

    @Override
    public String createPaymentLink(long payosOrderCode, BigDecimal amount, UUID bookingId) {

        try {
            String returnUrl = frontendBaseUrl + successPath + "?bookingId=" + bookingId;
            String cancelUrl = frontendBaseUrl + cancelPath + "?bookingId=" + bookingId;

            CreatePaymentLinkRequest request =
                    CreatePaymentLinkRequest.builder()
                            .orderCode(payosOrderCode) // MUST be unique
                            .amount(amount.longValue())
                            .description("Car rental payment")
                            .returnUrl(returnUrl)
                            .cancelUrl(cancelUrl)
                            .build();

            CreatePaymentLinkResponse response =
                    payOS.paymentRequests().create(request);

            return response.getCheckoutUrl();

        } catch (Exception e) {
            throw new RuntimeException("Create PayOS payment failed", e);
        }
    }

    @Override
    public String getPaymentLink(long payosOrderCode) {
        throw new UnsupportedOperationException(
                "PayOS does not support getting payment link by order code. Store checkoutUrl in DB or just create new links."
        );
    }


    @Override
    @Transactional
    public ResponseEntity<String> handleWebhook(Webhook webhook) {
        try {
            var data = payOS.webhooks().verify(webhook);
            Long orderCode = data.getOrderCode();

            Optional<PaymentTransaction> optionalTx =
                    paymentTransactionRepository.findByPayOSPaymentCode(orderCode);

            if (optionalTx.isEmpty()) {
                // Still return 200 so PayOS doesn't retry forever
                System.err.println("Không tìm thấy transaction cho orderCode: " + orderCode);
                return ResponseEntity.ok("OK");
            }

            PaymentTransaction transaction = optionalTx.get();

            // Idempotency check
            if (transaction.getStatus().equals(PaymentStatus.PAID)) {
                System.out.println("Transaction đã xử lý rồi: " + orderCode);
                return ResponseEntity.ok("OK");
            }

            transaction.setStatus(PaymentStatus.PAID);
            transaction.getBooking().setStatus(BookingStatus.CONFIRMED);
            paymentTransactionRepository.save(transaction);
            //TODO: mark booking status to enum = CONFIRMED if is still enum = CREATED. If enum = CANCELLED (payment too late) then will perform to return money back according to business rule

            System.out.println("Thanh toán thành công: " + orderCode);
            return ResponseEntity.ok("OK");

        } catch (Exception e) {
            System.err.println("Webhook không hợp lệ: " + e.getMessage());
            return ResponseEntity.badRequest().body("Invalid webhook");
        }
    }

}
