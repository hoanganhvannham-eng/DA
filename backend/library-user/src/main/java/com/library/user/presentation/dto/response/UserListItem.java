package com.library.user.presentation.dto.response;

import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.enums.UserStatus;

import java.time.Instant;
import java.util.UUID;

public class UserListItem {
    private UUID id;
    private String email;
    private String name;
    private UserRole role;
    private Instant joinedDate;
    private UserStatus status;

    public UserListItem() {}

    public UserListItem(UUID id, String email, String name, UserRole role, Instant joinedDate, UserStatus status) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
        this.joinedDate = joinedDate;
        this.status = status;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }
    public Instant getJoinedDate() { return joinedDate; }
    public void setJoinedDate(Instant joinedDate) { this.joinedDate = joinedDate; }
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
}
