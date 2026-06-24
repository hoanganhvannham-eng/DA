package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class RejectionReasonTooLongException extends BusinessException {
    public RejectionReasonTooLongException() {
        super(ErrorCode.REJECTION_REASON_TOO_LONG);
    }
}
