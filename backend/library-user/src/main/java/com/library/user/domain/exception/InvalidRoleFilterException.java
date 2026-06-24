package com.library.user.domain.exception;

public class InvalidRoleFilterException extends RuntimeException {
    public InvalidRoleFilterException() {
        super("Giá trị vai trò không hợp lệ. Chỉ chấp nhận: READER, LIBRARIAN, ADMIN");
    }
}
