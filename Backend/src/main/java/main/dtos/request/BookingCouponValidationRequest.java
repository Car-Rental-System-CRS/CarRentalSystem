package main.dtos.request;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingCouponValidationRequest {
    private UUID carTypeId;
    private Integer quantity;
    private List<UUID> selectedCarIds;
    private LocalDateTime expectedReceiveDate;
    private LocalDateTime expectedReturnDate;
    private String couponCode;
}
