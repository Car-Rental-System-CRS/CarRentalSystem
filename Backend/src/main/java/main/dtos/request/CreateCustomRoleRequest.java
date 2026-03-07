package main.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;
import main.enums.Role;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateCustomRoleRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private Role baseRole;

    @NotNull
    private List<String> scopes;
}
