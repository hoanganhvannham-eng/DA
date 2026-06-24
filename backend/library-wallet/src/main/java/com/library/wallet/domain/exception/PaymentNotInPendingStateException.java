package com.library.wallet.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class PaymentNotInPendingStateException extends BusinessException {
    public PaymentNotInPendingStateException() {
        super(ErrorCode.PAYMENT_NOT_PENDING);
    }
}
