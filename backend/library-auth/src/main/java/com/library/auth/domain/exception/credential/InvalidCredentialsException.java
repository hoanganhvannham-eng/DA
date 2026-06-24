package com.library.auth.domain.exception.credential;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidCredentialsException extends BusinessException {
    public InvalidCredentialsException() {
        super(ErrorCode.AUTH_INVALID_CREDENTIALS);
    }
}
