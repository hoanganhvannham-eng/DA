package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FinePaymentStatusNotAllowedException extends BusinessException {
    public FinePaymentStatusNotAllowedException() {
        super(ErrorCode.FINE_PAY_STATUS_NOT_ALLOWED);
    }
}
