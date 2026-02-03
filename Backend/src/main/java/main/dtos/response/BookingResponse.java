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

    private List<CarResponse> cars;

    private BigDecimal totalPrice;
    private BigDecimal bookingPrice;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;

    private BookingStatus status;

    private LocalDateTime createdAt;

    private List<PaymentTransactionResponse> payments;

}
