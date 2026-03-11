package main.dtos.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PostTripConditionRequest {

    @NotNull(message = "Overall condition rating is required")
    @DecimalMin(value = "1.0", message = "Rating must be at least 1")
    @DecimalMax(value = "5.0", message = "Rating must be at most 5")
    private BigDecimal overallConditionRating;

    @NotNull(message = "Odometer reading is required")
    @Min(value = 0, message = "Odometer must be non-negative")
    private Integer odometerReading;

    /** e.g. EMPTY, QUARTER, HALF, THREE_QUARTER, FULL */
    @NotNull(message = "Fuel level is required")
    private String fuelLevel;

    private String damageNotes;
}