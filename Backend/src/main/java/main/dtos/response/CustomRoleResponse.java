package main.dtos.response;

import lombok.*;
import main.enums.Role;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CustomRoleResponse {
    private UUID id;
    private String name;
    private String description;
    private Role baseRole;
    private Boolean isDefault;
    private List<String> scopes;
    private Instant createdAt;
    private Instant modifiedAt;
}
