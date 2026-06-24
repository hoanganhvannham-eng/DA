package com.library.auth.domain.exception.token;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class TokenAlreadyUsedException extends BusinessException {
    public TokenAlreadyUsedException() {
        super(ErrorCode.AUTH_TOKEN_ALREADY_USED);
    }
}
