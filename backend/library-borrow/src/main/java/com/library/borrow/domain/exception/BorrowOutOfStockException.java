package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class BorrowOutOfStockException extends BusinessException {

    public BorrowOutOfStockException() {
        super(ErrorCode.BORROW_OUT_OF_STOCK);
    }
}
