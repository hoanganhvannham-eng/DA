package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReadingPathInvalidBooksException extends BusinessException {

    public ReadingPathInvalidBooksException() {
        super(ErrorCode.READING_PATH_INVALID_BOOKS);
    }
}
