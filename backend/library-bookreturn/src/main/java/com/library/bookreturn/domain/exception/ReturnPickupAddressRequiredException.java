package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnPickupAddressRequiredException extends BusinessException {

    public ReturnPickupAddressRequiredException() {
        super(ErrorCode.RETURN_PICKUP_ADDRESS_REQUIRED);
    }
}
