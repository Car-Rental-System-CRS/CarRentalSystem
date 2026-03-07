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
public class AccountAdminResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private Role baseRole;
    private CustomRoleSummary customRole;
    private Instant createdAt;
    private Instant modifiedAt;

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    @Builder
    public static class CustomRoleSummary {
        private UUID id;
        private String name;
    }
}
