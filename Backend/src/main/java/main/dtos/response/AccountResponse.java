package main.dtos.response;

import lombok.*;

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
}