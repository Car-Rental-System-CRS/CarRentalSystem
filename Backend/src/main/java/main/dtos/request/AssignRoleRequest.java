package main.dtos.request;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class AssignRoleRequest {
    @NotNull
    private UUID customRoleId;
}
