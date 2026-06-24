package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class MaxActiveBorrowsException extends BusinessException {

    public MaxActiveBorrowsException() {
        super(ErrorCode.MAX_ACTIVE_BORROWS);
    }
}
