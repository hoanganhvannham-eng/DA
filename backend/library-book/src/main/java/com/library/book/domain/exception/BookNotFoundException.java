package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class BookNotFoundException extends BusinessException {

    public BookNotFoundException() {
        super(ErrorCode.BOOK_NOT_FOUND);
    }
}
