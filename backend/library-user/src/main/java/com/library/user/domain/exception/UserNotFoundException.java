package com.library.user.domain.exception;

public class UserNotFoundException extends RuntimeException {
    public UserNotFoundException() {
        super("Người dùng không tồn tại");
    }
}
