package main.dtos.response;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarResponse {
    private UUID carId;
    private String licensePlate;
    private LocalDateTime importDate;
    private CarTypeResponse carType;
}
