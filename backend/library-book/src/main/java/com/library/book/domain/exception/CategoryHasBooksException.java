package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class CategoryHasBooksException extends BusinessException {

    public CategoryHasBooksException() {
        super(ErrorCode.CATEGORY_HAS_BOOKS);
    }
}
