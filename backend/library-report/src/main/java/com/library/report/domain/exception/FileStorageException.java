package com.library.report.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FileStorageException extends BusinessException {
    public FileStorageException(ErrorCode errorCode, String message) {
        super(errorCode, message);
    }
}
