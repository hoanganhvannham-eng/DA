package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineLevelDateInvalidException extends BusinessException {

    public FineLevelDateInvalidException() {
        super(ErrorCode.FINE_LEVEL_DATE_INVALID);
    }
}
