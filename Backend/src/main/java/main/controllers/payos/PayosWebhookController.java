package main.controllers.payos;

import lombok.RequiredArgsConstructor;
import main.dtos.request.PayosWebhookRequest;
import main.entities.Order;
import main.entities.OrderStatus;
import main.repositories.OrderRepository;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payos")
@RequiredArgsConstructor
public class PayosWebhookController {

    private final OrderRepository orderRepository;

    @PostMapping("/webhook")
    public String handleWebhook(@RequestBody PayosWebhookRequest request) {

        // PayOS success code = "00"
        if (!"00".equals(request.getCode())) {
            return "IGNORED";
        }

        Long orderCode = request.getData().getOrderCode();
        String status = request.getData().getStatus();

        Order order = orderRepository.findOrderByPayosOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        switch (status) {
            case "PAID" -> order.setStatus(OrderStatus.PAID);
            case "CANCELLED" -> order.setStatus(OrderStatus.CANCELLED);
            default -> order.setStatus(OrderStatus.EXPIRED);
        }

        orderRepository.save(order);

        return "OK";
    }
}
