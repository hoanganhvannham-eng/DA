package com.library.report.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ExportNotReadyException extends BusinessException {
    public ExportNotReadyException(String message) {
        super(ErrorCode.EXPORT_NOT_READY, message);
    }
}
