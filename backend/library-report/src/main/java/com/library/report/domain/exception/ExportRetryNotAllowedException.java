package com.library.report.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ExportRetryNotAllowedException extends BusinessException {
    public ExportRetryNotAllowedException(String message) {
        super(ErrorCode.EXPORT_RETRY_NOT_ALLOWED, message);
    }
}
