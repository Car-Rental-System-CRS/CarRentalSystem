package main.services;

import main.dtos.response.AccountResponse;
import main.entities.Account;

import java.util.Optional;

public interface AccountService {
    Optional<Account> findByEmail(String email);
    Account save(Account account);
    AccountResponse me();
}