package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineNotPendingConfirmException extends BusinessException {
    public FineNotPendingConfirmException() {
        super(ErrorCode.FINE_NOT_PENDING_CONFIRM);
    }
}
