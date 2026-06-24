package com.library.auth.domain.exception.token;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class TokenNotFoundException extends BusinessException {
    public TokenNotFoundException() {
        super(ErrorCode.AUTH_TOKEN_NOT_FOUND);
    }
}
