package main.dtos.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class UpdateCustomRoleRequest {
    @NotBlank
    private String name;

    private String description;

    @NotNull
    private List<String> scopes;
}
