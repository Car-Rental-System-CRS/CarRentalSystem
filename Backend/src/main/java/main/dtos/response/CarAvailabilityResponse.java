package main.dtos.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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
public class CarAvailabilityResponse {
    private UUID carTypeId;
    private String carTypeName;
    private int totalCount;
    private int availableCount;
    private BigDecimal pricePerHour;
    private BigDecimal pricePerDay;
    private LocalDateTime pickupDateTime;
    private LocalDateTime returnDateTime;
}
