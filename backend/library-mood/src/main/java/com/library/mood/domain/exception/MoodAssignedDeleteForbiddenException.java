package com.library.mood.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class MoodAssignedDeleteForbiddenException extends BusinessException {

    public MoodAssignedDeleteForbiddenException() {
        super(ErrorCode.MOOD_ASSIGNED_DELETE_FORBIDDEN);
    }
}
