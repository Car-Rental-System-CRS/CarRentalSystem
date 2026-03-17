package main.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import main.enums.BookingStatus;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class AdminBookingResponse {

    private UUID id;

    private List<CarResponse> cars;

    private BigDecimal totalPrice;
    private BigDecimal bookingPrice;
    private BigDecimal depositAmount;
    private BigDecimal remainingAmount;
    private BigDecimal overdueCharge;

    private LocalDateTime expectedReceiveDate;
    private LocalDateTime expectedReturnDate;

    private LocalDateTime actualReceiveDate;
    private LocalDateTime actualReturnDate;

    private String pickupNotes;
    private String returnNotes;
    private LocalDateTime postTripInspectionAt;
    private Boolean postTripInspectionCompleted;

    private BookingStatus status;

    private LocalDateTime createdAt;

    private List<PaymentTransactionResponse> payments;

    private List<BookingNotificationResponse> notifications;

    // Customer info
    private String customerName;
    private String customerEmail;
    private String customerPhone;
}
