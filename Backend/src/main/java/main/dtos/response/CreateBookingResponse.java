package main.dtos.response;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class CreateBookingResponse {
    private Long bookingId;
    private Long amount;
    private String status;
    private String checkoutUrl;
}
