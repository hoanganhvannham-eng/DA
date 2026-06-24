package com.library.auth.domain.exception.token;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class TokenExpiredException extends BusinessException {
    public TokenExpiredException() {
        super(ErrorCode.AUTH_TOKEN_EXPIRED);
    }

    public TokenExpiredException(String message) {
        super(ErrorCode.AUTH_TOKEN_EXPIRED, message);
    }
}
