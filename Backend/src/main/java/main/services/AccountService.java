package main.services;

import main.dtos.response.AccountAdminResponse;
import main.dtos.response.AccountResponse;
import main.entities.Account;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.userdetails.UserDetailsService;

import main.enums.Role;
import main.security.CustomUserDetails;

public interface AccountService extends UserDetailsService {
    Optional<Account> findByEmail(String email);
    Account save(Account account);
    AccountResponse me(UUID accountId);
    @Override
    CustomUserDetails loadUserByUsername(String accountId);
    Page<AccountAdminResponse> getAllUsers(Pageable pageable, String search, Role baseRole);
    AccountAdminResponse getUserById(UUID id);
    AccountAdminResponse assignCustomRole(UUID accountId, UUID customRoleId);
    AccountAdminResponse changeBaseRole(UUID accountId, Role newBaseRole);
}