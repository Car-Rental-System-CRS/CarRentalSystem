package main.dtos.response;

import lombok.*;
import java.util.UUID;

@Getter @Setter
@AllArgsConstructor @NoArgsConstructor
@Builder
public class AuthResponse {
    private String token;
    private String tokenType; // Bearer
    private UUID userId;
    private String email;
    private String name;
    private String role; // vẫn trả về "USER" cố định để client dùng
}
