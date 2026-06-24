package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineLevelNotFoundException extends BusinessException {

    public FineLevelNotFoundException() {
        super(ErrorCode.FINE_LEVEL_NOT_FOUND);
    }
}
