package com.library.user.domain.exception;

public class SelfDeactivateException extends RuntimeException {
    public SelfDeactivateException() {
        super("Không thể vô hiệu hóa tài khoản của chính bạn");
    }
}
