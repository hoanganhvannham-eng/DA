package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnBookMismatchException extends BusinessException {

    public ReturnBookMismatchException() {
        super(ErrorCode.RETURN_BOOK_MISMATCH);
    }
}
