package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class IsbnAlreadyExistsException extends BusinessException {

    public IsbnAlreadyExistsException() {
        super(ErrorCode.ISBN_ALREADY_EXISTS);
    }
}
