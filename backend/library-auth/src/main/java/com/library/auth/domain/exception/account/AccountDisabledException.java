package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class AccountDisabledException extends BusinessException {
    public AccountDisabledException() {
        super(ErrorCode.AUTH_ACCOUNT_DISABLED);
    }
}
