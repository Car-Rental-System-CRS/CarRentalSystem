package main.services;

import main.dtos.response.AccountResponse;
import main.entities.Account;

import java.util.Optional;
import java.util.UUID;

import org.springframework.security.core.userdetails.UserDetailsService;

import main.security.CustomUserDetails;

public interface AccountService extends UserDetailsService{
    Optional<Account> findByEmail(String email);
    Account save(Account account);
    AccountResponse me(UUID accountId);
    @Override
    CustomUserDetails loadUserByUsername(String accountId);
}