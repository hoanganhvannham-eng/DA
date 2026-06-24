package com.library.auth.domain.exception.credential;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidOldPasswordException extends BusinessException {
    public InvalidOldPasswordException() {
        super(ErrorCode.AUTH_INVALID_OLD_PASSWORD);
    }
}
