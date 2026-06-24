package com.library.user.presentation.dto.request;

import com.library.auth.domain.enums.UserStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private UserStatus status;

    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
}
