package com.library.auth.domain.exception.credential;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class SamePasswordException extends BusinessException {
    public SamePasswordException() {
        super(ErrorCode.AUTH_SAME_PASSWORD);
    }
}
