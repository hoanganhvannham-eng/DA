package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class MoodNotFoundException extends BusinessException {

    public MoodNotFoundException() {
        super(ErrorCode.MOOD_NOT_FOUND);
    }
}
