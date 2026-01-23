package main.dtos.request;

import lombok.*;

@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateAccountRequest {
    private String name;
    private String email;
    private String password;
}
