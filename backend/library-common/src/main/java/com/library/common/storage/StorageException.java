package com.library.common.storage;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class StorageException extends BusinessException {

    public StorageException(ErrorCode errorCode) {
        super(errorCode);
    }
}
