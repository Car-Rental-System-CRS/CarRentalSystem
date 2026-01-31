package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AccountResponse;
import main.dtos.response.AuthResponse;
import main.entities.Account;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.security.JwtService;
import main.services.AuthService;
import main.services.TokenBlacklistService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.HashMap;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AccountMapper accountMapper;
    private final TokenBlacklistService tokenBlacklistService;

    @Override
    public AccountResponse register(CreateAccountRequest req) {
        if (accountRepository.existsByEmail(req.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        String encoded = passwordEncoder.encode(req.getPassword()); // BCrypt ra String
        byte[] stored = encoded.getBytes(StandardCharsets.UTF_8);   // Lưu thành bytes

        Account account = Account.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(stored)
                .build();

        accountRepository.save(account);
        return accountMapper.toResponse(account);
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        var authToken = new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword());
        authenticationManager.authenticate(authToken);

        Account account = accountRepository.findByEmail(req.getEmail()).orElseThrow();

        var claims = new HashMap<String, Object>();
        claims.put("role", "USER");

        String token = jwtService.generateToken(
                // Dùng UserDetails tạm thời (password không cần đúng lúc generate)
                org.springframework.security.core.userdetails.User
                        .withUsername(account.getEmail())
                        .password(new String(account.getPassword(), StandardCharsets.UTF_8))
                        .roles("USER")
                        .build(),
                claims
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .userId(account.getId())
                .email(account.getEmail())
                .name(account.getName())
                .role("USER")
                .build();
    }

    @Override
    public void logout(String bearerToken) {
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            tokenBlacklistService.revoke(bearerToken.substring(7));
        }
    }
}
