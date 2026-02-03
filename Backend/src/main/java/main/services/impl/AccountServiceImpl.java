package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.services.AccountService;
import org.springframework.stereotype.Service;

import java.util.Optional;
import java.util.UUID;

import main.security.CustomUserDetails;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

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
    public AccountResponse me(UUID accountId) {
        Account acc = accountRepository.findById(accountId).orElseThrow();
        return accountMapper.toResponse(acc);
    }

    @Override
    public CustomUserDetails loadUserByUsername(String accountId) {
        Account acc = accountRepository.findById(UUID.fromString(accountId)).orElseThrow(() -> new IllegalArgumentException("User not found"));
        return CustomUserDetails.builder()
                .accountId(acc.getId())
                .role(acc.getRole())
                .build();
    }
}