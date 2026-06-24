package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class AccountPendingException extends BusinessException {
    public AccountPendingException() {
        super(ErrorCode.AUTH_ACCOUNT_PENDING);
    }
}
