package main.controllers;


import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateBookingRequest;
import main.dtos.response.CreateBookingResponse;
import main.services.BookingService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/booking")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    public CreateBookingResponse createBooking(
            @RequestBody CreateBookingRequest request
    ) {
        return bookingService.createBooking(request.getAmount());
    }
}
