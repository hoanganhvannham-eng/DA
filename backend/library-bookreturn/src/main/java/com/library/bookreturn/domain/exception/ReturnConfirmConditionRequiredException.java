package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnConfirmConditionRequiredException extends BusinessException {

    public ReturnConfirmConditionRequiredException() {
        super(ErrorCode.RETURN_CONFIRM_CONDITION_REQUIRED);
    }
}
