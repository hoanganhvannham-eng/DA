package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FileStorageUploadFailedException extends BusinessException {
    public FileStorageUploadFailedException() {
        super(ErrorCode.FILE_STORAGE_UPLOAD_FAILED);
    }
}
