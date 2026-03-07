package main.services.impl;

import lombok.RequiredArgsConstructor;
import main.dtos.request.CreateCustomRoleRequest;
import main.dtos.request.UpdateCustomRoleRequest;
import main.dtos.response.CustomRoleResponse;
import main.entities.CustomRole;
import main.entities.CustomRoleScope;
import main.enums.Role;
import main.enums.Scope;
import main.repositories.CustomRoleRepository;
import main.services.CustomRoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomRoleServiceImpl implements CustomRoleService {

    private final CustomRoleRepository customRoleRepository;

    @Override
    @Transactional
    public CustomRoleResponse createRole(CreateCustomRoleRequest request) {
        if (customRoleRepository.existsByName(request.getName())) {
            throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
        }

        // Validate that base role is STAFF or ADMIN
        if (request.getBaseRole() == Role.USER) {
            throw new IllegalArgumentException("Cannot create custom roles for USER base role");
        }

        CustomRole role = CustomRole.builder()
                .name(request.getName())
                .description(request.getDescription())
                .baseRole(request.getBaseRole())
                .isDefault(false)
                .build();

        // Parse and validate scopes
        List<CustomRoleScope> scopeEntities = request.getScopes().stream()
                .map(scopeName -> {
                    Scope scope = Scope.valueOf(scopeName);
                    validateScopeForBaseRole(scope, request.getBaseRole());
                    return CustomRoleScope.builder()
                            .customRole(role)
                            .scope(scope)
                            .build();
                })
                .collect(Collectors.toList());

        role.setScopes(scopeEntities);
        CustomRole saved = customRoleRepository.save(role);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public CustomRoleResponse updateRole(UUID id, UpdateCustomRoleRequest request) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Custom role not found"));

        if (role.getIsDefault()) {
            throw new IllegalArgumentException("Cannot modify default roles");
        }

        if (customRoleRepository.existsByNameAndIdNot(request.getName(), id)) {
            throw new IllegalArgumentException("Role with name '" + request.getName() + "' already exists");
        }

        role.setName(request.getName());
        role.setDescription(request.getDescription());

        // Clear and re-add scopes
        role.getScopes().clear();
        List<CustomRoleScope> scopeEntities = request.getScopes().stream()
                .map(scopeName -> {
                    Scope scope = Scope.valueOf(scopeName);
                    validateScopeForBaseRole(scope, role.getBaseRole());
                    return CustomRoleScope.builder()
                            .customRole(role)
                            .scope(scope)
                            .build();
                })
                .collect(Collectors.toList());
        role.getScopes().addAll(scopeEntities);

        CustomRole saved = customRoleRepository.save(role);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void deleteRole(UUID id) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Custom role not found"));

        if (role.getIsDefault()) {
            throw new IllegalArgumentException("Cannot delete default roles");
        }

        customRoleRepository.delete(role);
    }

    @Override
    public CustomRoleResponse getRoleById(UUID id) {
        CustomRole role = customRoleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Custom role not found"));
        return toResponse(role);
    }

    @Override
    public List<CustomRoleResponse> getAllRoles() {
        return customRoleRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<CustomRoleResponse> getRolesByBaseRole(Role baseRole) {
        return customRoleRepository.findByBaseRole(baseRole).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getScopesByBaseRole(Role baseRole) {
        return Arrays.stream(Scope.values())
                .filter(scope -> {
                    if (baseRole == Role.STAFF) return scope.isStaffScope();
                    if (baseRole == Role.ADMIN) return scope.isAdminScope();
                    return false;
                })
                .map(Scope::name)
                .collect(Collectors.toList());
    }

    @Override
    public List<String> getAllScopes() {
        return Arrays.stream(Scope.values())
                .map(Scope::name)
                .collect(Collectors.toList());
    }

    private void validateScopeForBaseRole(Scope scope, Role baseRole) {
        if (baseRole == Role.STAFF && !scope.isStaffScope()) {
            throw new IllegalArgumentException("Scope " + scope.name() + " is not valid for STAFF base role");
        }
        if (baseRole == Role.ADMIN && !scope.isAdminScope()) {
            throw new IllegalArgumentException("Scope " + scope.name() + " is not valid for ADMIN base role");
        }
    }

    private CustomRoleResponse toResponse(CustomRole role) {
        return CustomRoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .baseRole(role.getBaseRole())
                .isDefault(role.getIsDefault())
                .scopes(role.getScopes().stream()
                        .map(s -> s.getScope().name())
                        .collect(Collectors.toList()))
                .createdAt(role.getCreatedAt())
                .modifiedAt(role.getModifiedAt())
                .build();
    }
}
