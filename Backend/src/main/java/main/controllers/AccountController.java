package main.controllers;

import java.time.Instant;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.response.AccountResponse;
import main.security.CustomUserDetails;
import main.services.AccountService;
@RestController
@RequestMapping("/api/account")
@RequiredArgsConstructor
public class AccountController {
    private final AccountService accountService;
    
    @GetMapping("/me")
    public ResponseEntity<APIResponse<AccountResponse>> getMe(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(APIResponse.<AccountResponse>builder()
                .success(true)
                .message("Account details retrieved successfully")
                .data(accountService.me(userDetails.getAccountId()))
                .timestamp(Instant.now())
                .build());
    }
}
