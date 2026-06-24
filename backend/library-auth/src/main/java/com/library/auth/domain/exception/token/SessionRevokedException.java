package com.library.auth.domain.exception.token;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class SessionRevokedException extends BusinessException {
    public SessionRevokedException() {
        super(ErrorCode.AUTH_SESSION_REVOKED);
    }
}
