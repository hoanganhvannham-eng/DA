package com.library.auth.domain.exception.account;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class DuplicateEmailException extends BusinessException {
    public DuplicateEmailException() {
        super(ErrorCode.AUTH_DUPLICATE_EMAIL);
    }
}
