package main.dtos.request;

import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCarRequest {
    private String licensePlate;
    private LocalDateTime importDate;
    private UUID typeId;
}
