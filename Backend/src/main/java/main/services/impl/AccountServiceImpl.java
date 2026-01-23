package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.repositories.AccountRepository;
import main.services.AccountService;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {
    private final AccountRepository accountRepository;

}
