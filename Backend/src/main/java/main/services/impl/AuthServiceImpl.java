package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.entities.Account;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.security.JwtService;
import main.services.AuthService;
import main.services.TokenBlacklistService;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;

import main.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AccountMapper accountMapper;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public void register(CreateAccountRequest req) {
        if (accountRepository.existsByEmail(req.getEmail().toLowerCase())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String encoded = passwordEncoder.encode(req.getPassword());
        byte[] stored = encoded.getBytes(StandardCharsets.UTF_8);

        Account account = accountMapper.fromCreateAccountRequestToEntity(req);
        account.setPassword(stored);
        account.setEmail(account.getEmail().toLowerCase());
        accountRepository.save(account);
    }

    @Override
    public String login(LoginRequest req) {
        Account account = accountRepository.findByEmail(req.getEmail().toLowerCase()).orElseThrow();
        String token = jwtService.generateToken(CustomUserDetails.builder()
                .accountId(account.getId())
                .role(account.getRole())
                .build());
        return token;
    }

    @Override
    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            tokenBlacklistService.revoke(bearerToken.substring(7));
        }
    }
}
