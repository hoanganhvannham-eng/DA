package com.library.borrow.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class UnpaidFinesException extends BusinessException {

    public UnpaidFinesException() {
        super(ErrorCode.UNPAID_FINES_EXIST);
    }
}
