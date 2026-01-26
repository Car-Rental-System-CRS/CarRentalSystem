package main.dtos.response;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarTypeResponse {
    private int numberOfSeats;
    private String carName;
    // kWh per km
    private double consumptionKwhPerKm;
    private BigDecimal price;
    private CarBrandResponse carBrand;
}
