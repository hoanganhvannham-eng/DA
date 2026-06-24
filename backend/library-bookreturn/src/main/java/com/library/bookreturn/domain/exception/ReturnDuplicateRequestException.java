package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnDuplicateRequestException extends BusinessException {

    public ReturnDuplicateRequestException() {
        super(ErrorCode.RETURN_DUPLICATE_REQUEST);
    }
}
