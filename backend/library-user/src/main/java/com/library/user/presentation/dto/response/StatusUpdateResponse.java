package com.library.user.presentation.dto.response;

public class StatusUpdateResponse {
    private String message;
    private UserListItem updatedUser;

    public StatusUpdateResponse() {}

    public StatusUpdateResponse(String message, UserListItem updatedUser) {
        this.message = message;
        this.updatedUser = updatedUser;
    }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
    public UserListItem getUpdatedUser() { return updatedUser; }
    public void setUpdatedUser(UserListItem updatedUser) { this.updatedUser = updatedUser; }
}
