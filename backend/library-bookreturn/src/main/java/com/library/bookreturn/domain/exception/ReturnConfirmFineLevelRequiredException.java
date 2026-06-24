package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnConfirmFineLevelRequiredException extends BusinessException {

    public ReturnConfirmFineLevelRequiredException() {
        super(ErrorCode.RETURN_CONFIRM_FINE_LEVEL_REQUIRED);
    }
}
