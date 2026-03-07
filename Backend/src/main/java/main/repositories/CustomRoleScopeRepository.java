package main.repositories;

import main.entities.CustomRoleScope;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface CustomRoleScopeRepository extends JpaRepository<CustomRoleScope, UUID> {
    void deleteAllByCustomRoleId(UUID customRoleId);
}
