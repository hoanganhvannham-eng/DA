package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnShippingAttemptLimitExceededException extends BusinessException {
    public ReturnShippingAttemptLimitExceededException() {
        super(ErrorCode.RETURN_SHIPPING_ATTEMPT_LIMIT_EXCEEDED);
    }
}
