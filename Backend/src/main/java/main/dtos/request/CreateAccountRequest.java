package main.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;


@AllArgsConstructor
@NoArgsConstructor
@Setter
@Getter
@Builder
public class CreateAccountRequest {
    @NotBlank
    private String name;

    @Email @NotBlank
    private String email;

    @NotBlank @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
}