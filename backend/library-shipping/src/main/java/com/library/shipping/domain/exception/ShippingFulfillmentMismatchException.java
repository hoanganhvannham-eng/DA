package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ShippingFulfillmentMismatchException extends BusinessException {

    public ShippingFulfillmentMismatchException() {
        super(ErrorCode.SHIPPING_FULFILLMENT_MISMATCH);
    }
}
