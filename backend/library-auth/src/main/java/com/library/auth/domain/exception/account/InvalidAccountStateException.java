package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidAccountStateException extends BusinessException {
    public InvalidAccountStateException() {
        super(ErrorCode.AUTH_INVALID_ACCOUNT_STATE);
    }
}
