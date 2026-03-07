package main.controllers;

import lombok.RequiredArgsConstructor;
import main.services.PayosService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import vn.payos.model.webhooks.Webhook;


@RestController
@RequestMapping("/api/payos")
@RequiredArgsConstructor
public class PayosWebhookController {

    private final PayosService payosService;


    @PostMapping("/webhook")
    public ResponseEntity<String> handleWebhook(@RequestBody Webhook webhook) {
        return payosService.handleWebhook(webhook);
    }

}
