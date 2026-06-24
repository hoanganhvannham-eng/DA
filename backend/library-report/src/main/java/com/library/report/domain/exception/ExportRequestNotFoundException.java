package com.library.report.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ExportRequestNotFoundException extends BusinessException {
    public ExportRequestNotFoundException(String message) {
        super(ErrorCode.EXPORT_REQUEST_NOT_FOUND, message);
    }
}
