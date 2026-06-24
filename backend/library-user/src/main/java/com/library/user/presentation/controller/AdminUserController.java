package com.library.user.presentation.controller;

import com.library.common.security.CurrentUser;
import com.library.user.application.service.UserCommandService;
import com.library.user.application.service.UserQueryService;
import com.library.user.presentation.dto.request.AssignRoleRequest;
import com.library.user.presentation.dto.request.UpdateStatusRequest;
import com.library.user.presentation.dto.response.AssignRoleResponse;
import com.library.user.presentation.dto.response.PaginatedResult;
import com.library.user.presentation.dto.response.StatusUpdateResponse;
import com.library.user.presentation.dto.response.UserListItem;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/users")
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {

    private final UserQueryService userQueryService;
    private final UserCommandService userCommandService;

    public AdminUserController(UserQueryService userQueryService, UserCommandService userCommandService) {
        this.userQueryService = userQueryService;
        this.userCommandService = userCommandService;
    }

    @GetMapping
    public ResponseEntity<PaginatedResult<UserListItem>> getUsers(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String role,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int size) {

        PaginatedResult<UserListItem> result = userQueryService.getFilteredUsers(keyword, role, page, size);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{targetUserId}/status")
    public ResponseEntity<StatusUpdateResponse> updateUserStatus(
            @PathVariable UUID targetUserId,
            @Valid @RequestBody UpdateStatusRequest request,
            CurrentUser currentUser) {

        StatusUpdateResponse response = userCommandService.updateUserStatus(
                targetUserId, request.getStatus(), currentUser.id());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{targetUserId}/role")
    public ResponseEntity<AssignRoleResponse> assignRole(
            @PathVariable UUID targetUserId,
            @Valid @RequestBody AssignRoleRequest request,
            CurrentUser currentUser) {

        AssignRoleResponse response = userCommandService.assignRole(
                targetUserId, request.getNewRole(), currentUser.id());
        return ResponseEntity.ok(response);
    }
}
