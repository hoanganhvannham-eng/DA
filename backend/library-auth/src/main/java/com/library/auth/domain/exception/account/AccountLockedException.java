package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;
import lombok.Getter;

@Getter
public class AccountLockedException extends BusinessException {
    private final long retryAfterSeconds;

    public AccountLockedException(long retryAfterSeconds) {
        super(ErrorCode.AUTH_TOO_MANY_ATTEMPTS);
        this.retryAfterSeconds = retryAfterSeconds;
    }
}
