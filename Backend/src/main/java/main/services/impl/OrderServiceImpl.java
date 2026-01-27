package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.CreateOrderResponse;
import main.entities.Order;
import main.entities.OrderStatus;
import main.repositories.OrderRepository;
import main.services.OrderService;
import main.services.payos.PayosService;
import org.springframework.stereotype.Service;


import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final PayosService payosService;

    @Override
    public CreateOrderResponse createOrder(Long amount) {
        // 1. Generate PayOS orderCode
        long payosOrderCode = System.currentTimeMillis();

        // 2. Create local order
        Order order = Order.builder()
                .payosOrderCode(payosOrderCode)
                .amount(amount)
                .status(OrderStatus.CREATED)
                .createdAt(LocalDateTime.now())
                .build();

        orderRepository.save(order);

        // 3. Create PayOS payment link
        String checkoutUrl =
                payosService.createPaymentLink(payosOrderCode, amount);

        // 4. Return response
        return new CreateOrderResponse(
                order.getId(),
                order.getAmount(),
                order.getStatus().name(),
                checkoutUrl
        );
    }

    @Override
    public void markPaid(Long orderCode) {
        Order order = orderRepository.findOrderByPayosOrderCode(orderCode)
                .orElseThrow(() -> new RuntimeException("Order not found"));

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);
    }
}
