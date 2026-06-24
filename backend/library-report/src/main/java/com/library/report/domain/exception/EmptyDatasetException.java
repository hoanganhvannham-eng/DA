package com.library.report.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class EmptyDatasetException extends BusinessException {
    public EmptyDatasetException(String message) {
        super(ErrorCode.REPORT_EXPORT_EMPTY_DATASET, message);
    }
}
