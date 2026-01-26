package main.dtos.request;

import lombok.*;

import java.math.BigDecimal;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCarTypeRequest {
    private int numberOfSeats;
    private String carName;
    // kWh per km
    private double consumptionKwhPerKm;
    private BigDecimal price;
}
