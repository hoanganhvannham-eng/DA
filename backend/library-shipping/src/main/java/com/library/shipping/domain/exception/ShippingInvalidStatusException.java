package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ShippingInvalidStatusException extends BusinessException {

    public ShippingInvalidStatusException() {
        super(ErrorCode.SHIPPING_INVALID_STATE);
    }
}
