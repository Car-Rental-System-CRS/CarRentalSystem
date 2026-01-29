package main.controllers;


import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateOrderRequest;
import main.dtos.response.CreateOrderResponse;
import main.services.BookingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public CreateOrderResponse createOrder(
            @RequestBody CreateOrderRequest request
    ) {
        return bookingService.createBooking(request.getAmount());
    }
}
