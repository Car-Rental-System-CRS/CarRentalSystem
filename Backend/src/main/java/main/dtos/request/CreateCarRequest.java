package main.dtos.request;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCarRequest {
    private String licensePlate;
    private LocalDate importDate;
    private UUID typeId;
}
