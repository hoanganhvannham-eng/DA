package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class BorrowNotFoundException extends BusinessException {

    public BorrowNotFoundException() {
        super(ErrorCode.BORROW_NOT_FOUND);
    }
}
