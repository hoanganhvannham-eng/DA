package com.library.wallet.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InsufficientBalanceException extends BusinessException {
    public InsufficientBalanceException() {
        super(ErrorCode.WALLET_INSUFFICIENT_BALANCE);
    }

    public InsufficientBalanceException(String customMessage) {
        super(ErrorCode.WALLET_INSUFFICIENT_BALANCE, customMessage);
    }
}
