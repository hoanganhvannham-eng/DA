package com.library.user.domain.exception;

public class InvalidStatusException extends RuntimeException {
    public InvalidStatusException() {
        super("Giá trị trạng thái không hợp lệ. Chỉ chấp nhận: ACTIVE, DISABLED");
    }
}
