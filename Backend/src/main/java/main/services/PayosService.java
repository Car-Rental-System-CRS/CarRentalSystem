package main.services;

import java.math.BigDecimal;
import java.util.UUID;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;

import vn.payos.model.webhooks.Webhook;

public interface PayosService {
    String createPaymentLink(long payosOrderCode, BigDecimal amount, UUID bookingId);
    ResponseEntity<String> handleWebhook(@RequestBody Webhook webhook);
}
