package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class BorrowAccessForbiddenException extends BusinessException {

    public BorrowAccessForbiddenException() {
        super(ErrorCode.AUTH_FORBIDDEN);
    }
}
