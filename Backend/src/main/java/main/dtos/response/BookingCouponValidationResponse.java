package main.dtos.response;

import java.math.BigDecimal;

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
public class BookingCouponValidationResponse {
    private boolean valid;
    private String couponCode;
    private BigDecimal originalTotal;
    private BigDecimal discountAmount;
    private BigDecimal discountedTotal;
    private String message;
}
