package main.controllers;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import main.dtos.APIResponse;
import main.dtos.request.AssignRoleRequest;
import main.dtos.request.CreateCustomRoleRequest;
import main.dtos.request.UpdateCustomRoleRequest;
import main.dtos.response.AccountAdminResponse;
import main.dtos.response.CustomRoleResponse;
import main.dtos.response.PageResponse;
import main.enums.Role;
import main.services.AccountService;
import main.services.CustomRoleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AccountService accountService;
    private final CustomRoleService customRoleService;

    // ===== USER MANAGEMENT =====

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('USER_VIEW')")
    public ResponseEntity<APIResponse<PageResponse<AccountAdminResponse>>> getAllUsers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Role baseRole,
            Pageable pageable
    ) {
        Page<AccountAdminResponse> result = accountService.getAllUsers(pageable, search, baseRole);
        PageResponse<AccountAdminResponse> pageResponse = PageResponse.from(result);

        return ResponseEntity.ok(APIResponse.<PageResponse<AccountAdminResponse>>builder()
                .success(true)
                .message("OK")
                .data(pageResponse)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('USER_VIEW')")
    public ResponseEntity<APIResponse<AccountAdminResponse>> getUserById(@PathVariable UUID id) {
        AccountAdminResponse data = accountService.getUserById(id);
        return ResponseEntity.ok(APIResponse.<AccountAdminResponse>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('USER_ROLE_ASSIGN')")
    public ResponseEntity<APIResponse<AccountAdminResponse>> assignCustomRole(
            @PathVariable UUID id,
            @Valid @RequestBody AssignRoleRequest request
    ) {
        AccountAdminResponse data = accountService.assignCustomRole(id, request.getCustomRoleId());
        return ResponseEntity.ok(APIResponse.<AccountAdminResponse>builder()
                .success(true)
                .message("Custom role assigned successfully")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @PutMapping("/users/{id}/base-role")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('USER_EDIT')")
    public ResponseEntity<APIResponse<AccountAdminResponse>> changeBaseRole(
            @PathVariable UUID id,
            @RequestParam Role baseRole
    ) {
        AccountAdminResponse data = accountService.changeBaseRole(id, baseRole);
        return ResponseEntity.ok(APIResponse.<AccountAdminResponse>builder()
                .success(true)
                .message("Base role changed successfully")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    // ===== ROLE MANAGEMENT =====

    @GetMapping("/roles")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_VIEW')")
    public ResponseEntity<APIResponse<List<CustomRoleResponse>>> getAllRoles() {
        List<CustomRoleResponse> data = customRoleService.getAllRoles();
        return ResponseEntity.ok(APIResponse.<List<CustomRoleResponse>>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_VIEW')")
    public ResponseEntity<APIResponse<CustomRoleResponse>> getRoleById(@PathVariable UUID id) {
        CustomRoleResponse data = customRoleService.getRoleById(id);
        return ResponseEntity.ok(APIResponse.<CustomRoleResponse>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/roles/by-base-role/{baseRole}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_VIEW')")
    public ResponseEntity<APIResponse<List<CustomRoleResponse>>> getRolesByBaseRole(@PathVariable Role baseRole) {
        List<CustomRoleResponse> data = customRoleService.getRolesByBaseRole(baseRole);
        return ResponseEntity.ok(APIResponse.<List<CustomRoleResponse>>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @PostMapping("/roles")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_CREATE')")
    public ResponseEntity<APIResponse<CustomRoleResponse>> createRole(
            @Valid @RequestBody CreateCustomRoleRequest request
    ) {
        CustomRoleResponse data = customRoleService.createRole(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(
                APIResponse.<CustomRoleResponse>builder()
                        .success(true)
                        .message("Custom role created")
                        .data(data)
                        .timestamp(Instant.now())
                        .build());
    }

    @PutMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_EDIT')")
    public ResponseEntity<APIResponse<CustomRoleResponse>> updateRole(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateCustomRoleRequest request
    ) {
        CustomRoleResponse data = customRoleService.updateRole(id, request);
        return ResponseEntity.ok(APIResponse.<CustomRoleResponse>builder()
                .success(true)
                .message("Custom role updated")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @DeleteMapping("/roles/{id}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_DELETE')")
    public ResponseEntity<APIResponse<Void>> deleteRole(@PathVariable UUID id) {
        customRoleService.deleteRole(id);
        return ResponseEntity.ok(APIResponse.<Void>builder()
                .success(true)
                .message("Custom role deleted")
                .timestamp(Instant.now())
                .build());
    }

    // ===== SCOPE REFERENCE =====

    @GetMapping("/scopes")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_VIEW')")
    public ResponseEntity<APIResponse<List<String>>> getAllScopes() {
        List<String> data = customRoleService.getAllScopes();
        return ResponseEntity.ok(APIResponse.<List<String>>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }

    @GetMapping("/scopes/by-base-role/{baseRole}")
    @PreAuthorize("hasRole('ADMIN') and hasAuthority('ROLE_VIEW')")
    public ResponseEntity<APIResponse<List<String>>> getScopesByBaseRole(@PathVariable Role baseRole) {
        List<String> data = customRoleService.getScopesByBaseRole(baseRole);
        return ResponseEntity.ok(APIResponse.<List<String>>builder()
                .success(true)
                .message("OK")
                .data(data)
                .timestamp(Instant.now())
                .build());
    }
}
