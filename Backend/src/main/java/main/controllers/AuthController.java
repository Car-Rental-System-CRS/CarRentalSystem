package main.controllers;

import java.time.Instant;

import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import main.dtos.APIResponse;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Auth", description = "Register, login, and logout with JWT")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @Operation(summary = "Register an account")
    public ResponseEntity<APIResponse<Void>> register(@Valid @RequestBody CreateAccountRequest request) {
        authService.register(request);
        return new ResponseEntity<>(APIResponse.<Void>builder()
            .success(true)
            .message("Account registered successfully") 
            .timestamp(Instant.now())
            .build(), HttpStatus.CREATED
        );
    }

    @PostMapping("/login")
    @Operation(summary = "Log in and receive a JWT")
    public ResponseEntity<APIResponse<Void>> login(@Valid @RequestBody LoginRequest request) {
        System.out.println("Login attempt for email: " + request.getEmail());
        HttpHeaders headers = new HttpHeaders();
        headers.add("Authorization", "Bearer " + authService.login(request));
        return new ResponseEntity<>(APIResponse.<Void>builder()
            .success(true)
            .message("Login successful")
            .timestamp(Instant.now())
            .build(), headers, HttpStatus.OK
        );
    }

    @PostMapping("/logout")
    @Operation(summary = "Log out (revoke the current token)")
    public ResponseEntity<APIResponse<Void>> logout(@RequestHeader(name = "Authorization", required = false) String bearer) {
        authService.logout(bearer);
        return new ResponseEntity<>(APIResponse.<Void>builder()
            .success(true)
            .message("Logout successful")
            .timestamp(Instant.now())
            .build(), HttpStatus.OK
        );
    }
}
