package main.configs;

import java.util.Arrays;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import main.entities.CustomRole;
import main.entities.CustomRoleScope;
import main.enums.Role;
import main.enums.Scope;
import main.repositories.CustomRoleRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final CustomRoleRepository customRoleRepository;
    private final EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        seedDefaultRole("Default Staff", Role.STAFF,
                Arrays.stream(Scope.values()).filter(Scope::isStaffScope).collect(Collectors.toList()));

        seedDefaultRole("Default Admin", Role.ADMIN,
                Arrays.stream(Scope.values()).filter(Scope::isAdminScope).collect(Collectors.toList()));
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
