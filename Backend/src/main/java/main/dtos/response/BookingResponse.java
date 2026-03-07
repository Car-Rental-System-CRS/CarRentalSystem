package main.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.BookingStatus;

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
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private BigDecimal overdueCharge;

    private LocalDate expectedReceiveDate;
    private LocalDate expectedReturnDate;

    private LocalDateTime actualReceiveDate;
    private LocalDateTime actualReturnDate;

    private BookingStatus status;

    private LocalDateTime createdAt;

    private List<PaymentTransactionResponse> payments;

}
