package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ShippingAttemptLimitExceededException extends BusinessException {

    public ShippingAttemptLimitExceededException() {
        super(ErrorCode.SHIPPING_ATTEMPT_LIMIT_EXCEEDED);
    }
}
