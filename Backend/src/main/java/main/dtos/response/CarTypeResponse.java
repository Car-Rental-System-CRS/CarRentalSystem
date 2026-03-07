package main.dtos.response;

import lombok.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarTypeResponse {
    private UUID id;
    private String name;
    private int numberOfSeats;
    // kWh per km
    private double consumptionKwhPerKm;
    private BigDecimal price;

    private String description;

    private int carQuantity;

    private CarBrandResponse carBrand;
    
    private List<MediaFileResponse> mediaFiles;
    
    private List<CarFeatureResponse> features;
}
