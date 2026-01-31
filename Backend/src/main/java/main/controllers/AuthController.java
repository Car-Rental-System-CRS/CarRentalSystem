package main.controllers;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AccountResponse;
import main.dtos.response.AuthResponse;
import main.services.AccountService;
import main.services.AuthService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Register, login, and logout with JWT")
public class AuthController {

    private final AuthService authService;
    private final AccountService accountService;

    @PostMapping(value = "/register",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Register an account")
    public ResponseEntity<AccountResponse> register(@Valid @RequestBody CreateAccountRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping(value = "/login",
        consumes = MediaType.APPLICATION_JSON_VALUE,
        produces = MediaType.APPLICATION_JSON_VALUE)
    @Operation(summary = "Log in and receive a JWT")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping(value = "/logout")
    @Operation(summary = "Log out (revoke the current token)")
    public ResponseEntity<Void> logout(@RequestHeader(name = "Authorization", required = false) String bearer) {
        authService.logout(bearer);
        return ResponseEntity.noContent().build();
    }

    @GetMapping(value = "/me", produces = MediaType.APPLICATION_JSON_VALUE)
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    @Operation(summary = "Get the current user profile")
    public ResponseEntity<AccountResponse> me() {
        return ResponseEntity.ok(accountService.me());
    }
}
