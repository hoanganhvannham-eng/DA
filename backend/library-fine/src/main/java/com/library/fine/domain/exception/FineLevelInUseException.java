package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineLevelInUseException extends BusinessException {

    public FineLevelInUseException() {
        super(ErrorCode.FINE_LEVEL_IN_USE);
    }
}
