package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class RejectionReasonRequiredException extends BusinessException {
    public RejectionReasonRequiredException() {
        super(ErrorCode.REJECTION_REASON_REQUIRED);
    }
}
