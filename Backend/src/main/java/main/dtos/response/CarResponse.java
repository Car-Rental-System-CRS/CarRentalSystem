package main.dtos.response;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CarResponse {
    private UUID id;
    private String licensePlate;
    private LocalDate importDate;
    private UUID typeId;
}
