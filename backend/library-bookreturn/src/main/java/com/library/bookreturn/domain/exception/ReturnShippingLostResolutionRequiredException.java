package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnShippingLostResolutionRequiredException extends BusinessException {
    public ReturnShippingLostResolutionRequiredException() {
        super(ErrorCode.RETURN_SHIPPING_LOST_RESOLUTION_REQUIRED);
    }
}
