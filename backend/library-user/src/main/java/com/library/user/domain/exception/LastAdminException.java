package com.library.user.domain.exception;

public class LastAdminException extends RuntimeException {
    public LastAdminException() {
        super("Hệ thống phải có ít nhất 1 quản lý viên");
    }
}
