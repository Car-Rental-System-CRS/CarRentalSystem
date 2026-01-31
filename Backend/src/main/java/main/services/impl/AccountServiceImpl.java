package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.services.AccountService;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService, UserDetailsService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;

    @Override
    public Optional<Account> findByEmail(String email) {
        return accountRepository.findByEmail(email);
    }

    @Override
    public Account save(Account account) {
        return accountRepository.save(account);
    }

    @Override
    public AccountResponse me() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        Account acc = accountRepository.findByEmail(email).orElseThrow();
        return accountMapper.toResponse(acc);
    }

    // Chuyển Account -> UserDetails (ROLE_USER mặc định)
    @Override
    public UserDetails loadUserByUsername(String username) {
        Account acc = accountRepository.findByEmail(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        String encoded = new String(acc.getPassword(), StandardCharsets.UTF_8);
        return User.withUsername(acc.getEmail())
                .password(encoded)
                .roles("USER")
                .build();
    }
}