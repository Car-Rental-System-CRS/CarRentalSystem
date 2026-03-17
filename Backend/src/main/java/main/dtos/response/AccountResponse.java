package main.dtos.response;

import lombok.*;
import main.enums.Role;

import java.util.List;
import java.util.UUID;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class AccountResponse {
    private UUID id;
    private String name;
    private String email;
    private String phone;
    private Role baseRole;
    private CustomRoleInfo customRole;
    private List<String> scopes;

    @AllArgsConstructor
    @NoArgsConstructor
    @Setter
    @Getter
    @Builder
    public static class CustomRoleInfo {
        private UUID id;
        private String name;
    }
}
