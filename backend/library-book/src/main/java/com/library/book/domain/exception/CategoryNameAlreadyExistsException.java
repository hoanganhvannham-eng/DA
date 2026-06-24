package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class CategoryNameAlreadyExistsException extends BusinessException {

    public CategoryNameAlreadyExistsException() {
        super(ErrorCode.CATEGORY_NAME_ALREADY_EXISTS);
    }
}
