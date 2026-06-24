package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnShippingNotAllowedException extends BusinessException {

    public ReturnShippingNotAllowedException() {
        super(ErrorCode.RETURN_SHIPPING_NOT_ALLOWED_FOR_FULFILLMENT);
    }
}
