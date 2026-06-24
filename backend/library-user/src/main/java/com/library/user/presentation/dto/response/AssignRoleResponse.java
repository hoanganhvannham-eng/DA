package com.library.user.presentation.dto.response;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserRole;

import java.time.Instant;

public class AssignRoleResponse {

    private String message;
    private UserListItem updatedUser;
    private Instant updatedAt;

    public AssignRoleResponse() {}

    public AssignRoleResponse(String message, User user, UserRole newRole, Instant updatedAt) {
        this.message = message;
        this.updatedUser = toUserListItem(user, newRole);
        this.updatedAt = updatedAt;
    }

    private static UserListItem toUserListItem(User user, UserRole newRole) {
        UserListItem item = new UserListItem(
                user.getId(),
                user.getEmail(),
                user.getName(),
                newRole,
                user.getJoinedDate(),
                user.getStatus()
        );
        return item;
    }

    public String getMessage() {
        return message;
    }

    public UserListItem getUpdatedUser() {
        return updatedUser;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}