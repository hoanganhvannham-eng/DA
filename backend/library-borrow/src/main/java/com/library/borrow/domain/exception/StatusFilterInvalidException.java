package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class StatusFilterInvalidException extends BusinessException {

    public StatusFilterInvalidException() {
        super(ErrorCode.STATUS_FILTER_INVALID);
    }
}
