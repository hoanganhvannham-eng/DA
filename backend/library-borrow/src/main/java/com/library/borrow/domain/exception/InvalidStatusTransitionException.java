package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidStatusTransitionException extends BusinessException {

    public InvalidStatusTransitionException() {
        super(ErrorCode.INVALID_STATUS_TRANSITION);
    }
}
