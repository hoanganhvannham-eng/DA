package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InvalidMoodIdsException extends BusinessException {

    public InvalidMoodIdsException() {
        super(ErrorCode.INVALID_MOOD_IDS);
    }
}
