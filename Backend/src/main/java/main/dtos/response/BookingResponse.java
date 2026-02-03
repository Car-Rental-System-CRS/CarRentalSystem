package main.dtos.response;

import lombok.*;
import main.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingResponse {

    private UUID id;

    // 🚗 Booked cars
    // TODO: replace UUID with CarResponse when Car module is ready
    //private List<UUID> carIds;

    // List of cars
    private List<CarResponse> cars;

    private BigDecimal totalPrice;
    private BigDecimal bookingPrice;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;

    private BookingStatus status;

    private LocalDateTime createdAt;

    // Payment summary
    private List<PaymentTransactionResponse> payments;

}
