package main.controllers;

import jakarta.validation.Valid;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AuthResponse;
import main.services.AuthService;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.tags.Tag;

@Tag(name = "Auth")
@RestController
@RequestMapping(value = "/api/auth", produces = MediaType.APPLICATION_JSON_VALUE)
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(
        value = "/register",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody CreateAccountRequest req) {
        AuthResponse res = authService.register(req); // đã insert DB
        return ResponseEntity.status(HttpStatus.CREATED).body(res); // trả JSON 201
    }

    @PostMapping(
        value = "/login",
        consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest req) {
        AuthResponse res = authService.login(req);
        return ResponseEntity.ok(res); // 200 JSON
    }
}
