package com.library.user.domain.exception;

public class SelfRoleChangeException extends RuntimeException {
    public SelfRoleChangeException() {
        super("Không thể thay đổi vai trò của chính bạn");
    }
}
