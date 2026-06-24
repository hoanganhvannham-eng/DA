package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnBulkConfirmInvalidConditionException extends BusinessException {

    public ReturnBulkConfirmInvalidConditionException() {
        super(ErrorCode.BULK_CONFIRM_INVALID_CONDITION);
    }
}
