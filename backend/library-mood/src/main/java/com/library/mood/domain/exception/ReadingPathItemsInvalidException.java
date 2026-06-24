package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReadingPathItemsInvalidException extends BusinessException {

    public ReadingPathItemsInvalidException() {
        super(ErrorCode.READING_PATH_ITEMS_INVALID);
    }
}
