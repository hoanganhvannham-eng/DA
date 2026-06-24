package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnStatusInvalidException extends BusinessException {

    public ReturnStatusInvalidException() {
        super(ErrorCode.RETURN_STATUS_INVALID);
    }
}
