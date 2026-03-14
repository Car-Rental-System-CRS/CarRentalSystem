package main.dtos.response;

import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
public class CarConditionResponse {
    private UUID id;
    private UUID carId;
    private String carName;
    private Integer odometer;
    private Integer fuelLevel;
    private List<MediaFileResponse> photos;
}