package main.services.impl;

import jakarta.transaction.Transactional;
import main.dtos.request.CreateAccountRequest;
import main.dtos.request.LoginRequest;
import main.dtos.response.AuthResponse;
import main.entities.Account;
import main.repositories.AccountRepository;
import main.security.JwtService;
import main.services.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class AuthServiceImpl implements AuthService {

    private final AccountRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthServiceImpl(AccountRepository repo, PasswordEncoder encoder, JwtService jwt) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwt = jwt;
    }

    @Override
    @Transactional
    public AuthResponse register(CreateAccountRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        if (repo.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already used");
        }
        Account a = new Account();
        a.setEmail(email);
        a.setPasswordHash(encoder.encode(req.getPassword())); // đảm bảo CreateAccountRequest có trường password
        a.setFullName(req.getFullName());
        a.setPhone(req.getPhone());
        a.setRole("CUSTOMER");
        a.setActive(true);
        repo.save(a);

        String token = jwt.generateToken(a.getEmail(), Map.of(
                "uid", a.getId(),
                "role", a.getRole()
        ));
        return new AuthResponse(token, a.getId(), a.getEmail(), a.getFullName(), a.getRole());
    }

    @Override
    public AuthResponse login(LoginRequest req) {
        String email = req.getEmail().trim().toLowerCase();
        Account a = repo.findByEmail(email).orElseThrow(() -> new IllegalArgumentException("Invalid credentials"));
        if (!a.isActive()) {
            throw new IllegalStateException("Account disabled");
        }
        if (!encoder.matches(req.getPassword(), a.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid credentials");
        }
        String token = jwt.generateToken(a.getEmail(), Map.of(
                "uid", a.getId(),
                "role", a.getRole()
        ));
        return new AuthResponse(token, a.getId(), a.getEmail(), a.getFullName(), a.getRole());
    }
}