package main.dtos.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CarConditionRequest {
    private UUID carId;
    private Integer odometer;
    private Integer fuelLevel;
}