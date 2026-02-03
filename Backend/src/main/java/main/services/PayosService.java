package main.services;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import vn.payos.model.webhooks.Webhook;

import java.math.BigDecimal;
import java.util.UUID;

public interface PayosService {
    String createPaymentLink(long payosOrderCode, BigDecimal amount, UUID bookingId);
    String getPaymentLink(long payosOrderCode);
    ResponseEntity<String> handleWebhook(@RequestBody Webhook webhook);
}
