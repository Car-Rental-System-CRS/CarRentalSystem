package main.configs;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.entities.Account;
import main.entities.CustomRole;
import main.entities.CustomRoleScope;
import main.enums.Role;
import main.enums.Scope;
import main.repositories.AccountRepository;
import main.repositories.CustomRoleRepository;

@Component
@Order(1)
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CustomRoleRepository customRoleRepository;
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;
    private final EntityManager entityManager;

    private static final String DEFAULT_SEEDED_PASSWORD = "password";

    @Override
    @Transactional
    public void run(String... args) {
        seedDefaultRole("Default Staff", Role.STAFF,
                Arrays.stream(Scope.values()).filter(Scope::isStaffScope).collect(Collectors.toList()));

        seedDefaultRole("Default Admin", Role.ADMIN,
                Arrays.stream(Scope.values()).filter(Scope::isAdminScope).collect(Collectors.toList()));

        seedDefaultAccount("System Admin", "admin@gmail.com", Role.ADMIN, "0900000001");
        seedDefaultAccount("Staff Lead", "staff@gmail.com", Role.STAFF, "0900000002");
    }

    private void seedDefaultAccount(String name, String email, Role role, String phone) {
        String normalizedEmail = email.toLowerCase();
        if (accountRepository.existsByEmail(normalizedEmail)) {
            log.info("Default account '{}' already exists, skipping.", normalizedEmail);
            return;
        }

        byte[] encodedPassword = passwordEncoder.encode(DEFAULT_SEEDED_PASSWORD)
                .getBytes(StandardCharsets.UTF_8);

        Account account = Account.builder()
                .name(name)
                .email(normalizedEmail)
                .role(role)
                .phone(phone)
                .password(encodedPassword)
                .build();

        accountRepository.save(account);
        log.info("Seeded default {} account '{}'.", role, normalizedEmail);
    }

    private void seedDefaultRole(String name, Role baseRole, List<Scope> scopes) {
        Optional<CustomRole> existing = customRoleRepository.findByBaseRoleAndIsDefaultTrue(baseRole);
        if (existing.isPresent()) {
            // Sync scopes: ensure the default role has all expected scopes
            CustomRole role = existing.get();
            Set<Scope> currentScopes = role.getScopes().stream()
                    .map(CustomRoleScope::getScope)
                    .collect(Collectors.toSet());
            Set<Scope> expectedScopes = new HashSet<>(scopes);

            if (!currentScopes.equals(expectedScopes)) {
                role.getScopes().clear();
                customRoleRepository.saveAndFlush(role);
                entityManager.flush();

                List<CustomRoleScope> scopeEntities = scopes.stream()
                        .map(scope -> CustomRoleScope.builder()
                                .customRole(role)
                                .scope(scope)
                                .build())
                        .collect(Collectors.toList());
                role.getScopes().addAll(scopeEntities);
                customRoleRepository.save(role);
                log.info("Updated default role '{}' for {} — synced {} scopes.", name, baseRole, scopes.size());
            } else {
                log.info("Default role for {} already up-to-date, skipping.", baseRole);
            }
            return;
        }

        // Check if any role with this name exists (non-default scenario)
        if (customRoleRepository.existsByName(name)) {
            log.info("Role with name '{}' already exists, skipping seed.", name);
            return;
        }

        CustomRole role = CustomRole.builder()
                .name(name)
                .description("Default role for " + baseRole.name() + " with full access")
                .baseRole(baseRole)
                .isDefault(true)
                .build();

        List<CustomRoleScope> scopeEntities = scopes.stream()
                .map(scope -> CustomRoleScope.builder()
                        .customRole(role)
                        .scope(scope)
                        .build())
                .collect(Collectors.toList());

        role.setScopes(scopeEntities);
        customRoleRepository.save(role);
        log.info("Seeded default role '{}' for {} with {} scopes.", name, baseRole, scopes.size());
    }
}
