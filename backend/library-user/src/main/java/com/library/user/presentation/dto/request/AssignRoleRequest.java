package com.library.user.presentation.dto.request;

import com.library.auth.domain.enums.UserRole;
import jakarta.validation.constraints.NotNull;

public class AssignRoleRequest {

    @NotNull(message = "Vai trò không được để trống")
    private UserRole newRole;

    public AssignRoleRequest() {}

    public AssignRoleRequest(UserRole newRole) {
        this.newRole = newRole;
    }

    public UserRole getNewRole() {
        return newRole;
    }

    public void setNewRole(UserRole newRole) {
        this.newRole = newRole;
    }
}
