package main.services;

import main.dtos.request.CreateCustomRoleRequest;
import main.dtos.request.UpdateCustomRoleRequest;
import main.dtos.response.CustomRoleResponse;
import main.enums.Role;

import java.util.List;
import java.util.UUID;

public interface CustomRoleService {
    CustomRoleResponse createRole(CreateCustomRoleRequest request);
    CustomRoleResponse updateRole(UUID id, UpdateCustomRoleRequest request);
    void deleteRole(UUID id);
    CustomRoleResponse getRoleById(UUID id);
    List<CustomRoleResponse> getAllRoles();
    List<CustomRoleResponse> getRolesByBaseRole(Role baseRole);
    List<String> getScopesByBaseRole(Role baseRole);
    List<String> getAllScopes();
}
