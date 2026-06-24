package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class BorrowShippingAlreadyStartedException extends BusinessException {

    public BorrowShippingAlreadyStartedException() {
        super(ErrorCode.SHIPPING_BORROW_ALREADY_STARTED);
    }
}
