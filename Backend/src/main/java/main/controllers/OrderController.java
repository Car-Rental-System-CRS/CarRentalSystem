package main.controllers;


import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateOrderRequest;
import main.dtos.response.CreateOrderResponse;
import main.entities.Order;
import main.services.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    public CreateOrderResponse createOrder(
            @RequestBody CreateOrderRequest request
    ) {
        return orderService.createOrder(request.getAmount());
    }
}
