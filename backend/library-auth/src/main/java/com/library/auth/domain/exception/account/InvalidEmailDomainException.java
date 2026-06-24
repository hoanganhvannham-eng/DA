package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidEmailDomainException extends BusinessException {
    public InvalidEmailDomainException() {
        super(ErrorCode.AUTH_INVALID_EMAIL_DOMAIN);
    }
}
