package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class MoodDuplicateNameException extends BusinessException {

    public MoodDuplicateNameException() {
        super(ErrorCode.MOOD_DUPLICATE_NAME);
    }
}
