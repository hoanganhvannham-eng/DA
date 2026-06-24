package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InsufficientBooksForPathException extends BusinessException {

    public InsufficientBooksForPathException() {
        super(ErrorCode.INSUFFICIENT_BOOKS_FOR_PATH);
    }
}
