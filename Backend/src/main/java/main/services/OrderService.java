package main.services;

import main.dtos.response.CreateOrderResponse;
import main.entities.Order;

public interface OrderService {
    CreateOrderResponse createOrder(Long amount);
    void markPaid(Long orderCode);
}
