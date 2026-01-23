package main.controllers;

import main.dtos.request.CreateAccountRequest;
import main.dtos.response.AccountResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    @PostMapping("/register")
    public ResponseEntity<AccountResponse> register(@RequestBody CreateAccountRequest user) {
        return ResponseEntity.ok(new AccountResponse());
    }
}
