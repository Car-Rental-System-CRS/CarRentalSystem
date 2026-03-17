package main.services.impl;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import lombok.RequiredArgsConstructor;
import main.dtos.request.UpdateAccountProfileRequest;
import main.dtos.response.AccountAdminResponse;
import main.dtos.response.AccountResponse;
import main.entities.Account;
import main.exceptions.ConflictException;
import main.entities.CustomRole;
import main.entities.CustomRoleScope;
import main.enums.Role;
import main.enums.Scope;
import main.mappers.AccountMapper;
import main.repositories.AccountRepository;
import main.repositories.CustomRoleRepository;
import main.security.CustomUserDetails;
import main.services.AccountService;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final AccountMapper accountMapper;
    private final CustomRoleRepository customRoleRepository;

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
        return toAccountResponse(acc);
    }

    @Override
    @Transactional
    public AccountResponse updateMyProfile(UUID accountId, UpdateAccountProfileRequest request) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        String name = normalizeRequired(request.getName(), "Name is required");
        String email = normalizeRequired(request.getEmail(), "Email is required");
        String phone = normalizeOptional(request.getPhone());

        if (!isValidEmail(email)) {
            throw new IllegalArgumentException("Email address is invalid");
        }

        if (phone != null && !phone.matches("^[0-9+\\-\\s()]{10,20}$")) {
            throw new IllegalArgumentException("Phone number format is invalid");
        }

        if (accountRepository.existsByEmailAndIdNot(email, accountId)) {
            throw new ConflictException("Email address is already in use");
        }

        acc.setName(name);
        acc.setEmail(email);
        acc.setPhone(phone);

        return toAccountResponse(accountRepository.save(acc));
    }

    @Override
    public CustomUserDetails loadUserByUsername(String accountId) {
        Account acc = accountRepository.findById(UUID.fromString(accountId))
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<Scope> scopes = resolveScopes(acc);

        return CustomUserDetails.builder()
                .accountId(acc.getId())
                .role(acc.getRole())
                .customRoleId(acc.getCustomRole() != null ? acc.getCustomRole().getId() : null)
                .scopes(scopes)
                .build();
    }

    @Override
    public Page<AccountAdminResponse> getAllUsers(Pageable pageable, String search, Role baseRole) {
        Page<Account> accounts = accountRepository.findAllWithFilters(search, baseRole, pageable);
        return accounts.map(this::toAdminResponse);
    }

    @Override
    public AccountAdminResponse getUserById(UUID id) {
        Account acc = accountRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return toAdminResponse(acc);
    }

    @Override
    @Transactional
    public AccountAdminResponse assignCustomRole(UUID accountId, UUID customRoleId) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (customRoleId == null) {
            acc.setCustomRole(null);
        } else {
            CustomRole customRole = customRoleRepository.findById(customRoleId)
                    .orElseThrow(() -> new IllegalArgumentException("Custom role not found"));

            if (customRole.getBaseRole() != acc.getRole()) {
                throw new IllegalArgumentException("Custom role base role (" + customRole.getBaseRole() +
                        ") does not match account base role (" + acc.getRole() + ")");
            }

            acc.setCustomRole(customRole);
        }

        accountRepository.save(acc);
        return toAdminResponse(acc);
    }

    @Override
    @Transactional
    public AccountAdminResponse changeBaseRole(UUID accountId, Role newBaseRole) {
        Account acc = accountRepository.findById(accountId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        acc.setRole(newBaseRole);
        acc.setCustomRole(null);
        accountRepository.save(acc);
        return toAdminResponse(acc);
    }

    private AccountAdminResponse toAdminResponse(Account acc) {
        AccountAdminResponse.CustomRoleSummary customRoleSummary = null;
        if (acc.getCustomRole() != null) {
            customRoleSummary = AccountAdminResponse.CustomRoleSummary.builder()
                    .id(acc.getCustomRole().getId())
                    .name(acc.getCustomRole().getName())
                    .build();
        }

        return AccountAdminResponse.builder()
                .id(acc.getId())
                .name(acc.getName())
                .email(acc.getEmail())
                .phone(acc.getPhone())
                .baseRole(acc.getRole())
                .customRole(customRoleSummary)
                .createdAt(acc.getCreatedAt())
                .modifiedAt(acc.getModifiedAt())
                .build();
    }

    private AccountResponse toAccountResponse(Account acc) {
        Set<Scope> scopes = resolveScopes(acc);

        AccountResponse.CustomRoleInfo customRoleInfo = null;
        if (acc.getCustomRole() != null) {
            customRoleInfo = AccountResponse.CustomRoleInfo.builder()
                    .id(acc.getCustomRole().getId())
                    .name(acc.getCustomRole().getName())
                    .build();
        }

        return AccountResponse.builder()
                .id(acc.getId())
                .name(acc.getName())
                .email(acc.getEmail())
                .phone(acc.getPhone())
                .baseRole(acc.getRole())
                .customRole(customRoleInfo)
                .scopes(scopes.stream().map(Scope::name).collect(Collectors.toList()))
                .build();
    }

    private String normalizeRequired(String value, String errorMessage) {
        String normalized = normalizeOptional(value);
        if (normalized == null) {
            throw new IllegalArgumentException(errorMessage);
        }
        return normalized;
    }

    private String normalizeOptional(String value) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");
    }

    /**
     * Resolves scopes for an account:
     * - USER base role: no scopes (scopes only for STAFF/ADMIN)
     * - If custom role assigned: use that custom role's scopes
     * - If no custom role: get all scopes for the base role (full access)
     */
    private Set<Scope> resolveScopes(Account account) {
        if (account.getRole() == Role.USER) {
            return new HashSet<>();
        }

        // If account has a custom role, use its scopes
        if (account.getCustomRole() != null) {
            return account.getCustomRole().getScopes().stream()
                    .map(CustomRoleScope::getScope)
                    .collect(Collectors.toSet());
        }

        // No custom role assigned → check for default custom role for base role
        Optional<CustomRole> defaultRole = customRoleRepository.findByBaseRoleAndIsDefaultTrue(account.getRole());
        if (defaultRole.isPresent()) {
            return defaultRole.get().getScopes().stream()
                    .map(CustomRoleScope::getScope)
                    .collect(Collectors.toSet());
        }

        // Fallback: return all scopes for the base role (full access)
        return Arrays.stream(Scope.values())
                .filter(scope -> {
                    if (account.getRole() == Role.STAFF) return scope.isStaffScope();
                    if (account.getRole() == Role.ADMIN) return scope.isAdminScope();
                    return false;
                })
                .collect(Collectors.toSet());
    }
}
