package com.library.auth.domain.exception.token;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class SessionNotFoundException extends BusinessException {
    public SessionNotFoundException() {
        super(ErrorCode.AUTH_UNAUTHORIZED);
    }
}
