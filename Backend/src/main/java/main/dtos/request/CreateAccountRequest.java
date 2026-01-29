package main.dtos.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * Dùng cho /api/auth/register
 * YÊU CẦU: các tên getter phải khớp với code trong AuthServiceImpl:
 *   getEmail(), getPassword(), getFullName(), getPhone()
 */
public class CreateAccountRequest {

    @Email
    @NotBlank
    private String email;

    @NotBlank
    @Size(min = 6, max = 100)
    private String password;

    @Size(max = 150)
    private String fullName;

    @Size(max = 30)
    private String phone;

    // --- getters & setters ---
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
}