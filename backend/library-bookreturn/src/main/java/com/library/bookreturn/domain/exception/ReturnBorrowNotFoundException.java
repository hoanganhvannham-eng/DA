package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnBorrowNotFoundException extends BusinessException {

    public ReturnBorrowNotFoundException() {
        super(ErrorCode.RETURN_BORROW_NOT_FOUND);
    }
}
