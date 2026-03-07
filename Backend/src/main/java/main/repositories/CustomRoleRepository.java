package main.repositories;

import main.entities.CustomRole;
import main.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CustomRoleRepository extends JpaRepository<CustomRole, UUID> {
    List<CustomRole> findByBaseRole(Role baseRole);
    Optional<CustomRole> findByBaseRoleAndIsDefaultTrue(Role baseRole);
    boolean existsByName(String name);
    boolean existsByNameAndIdNot(String name, UUID id);
}
