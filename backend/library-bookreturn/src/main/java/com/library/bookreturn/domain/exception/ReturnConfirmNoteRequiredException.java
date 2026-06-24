package com.library.bookreturn.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ReturnConfirmNoteRequiredException extends BusinessException {

    public ReturnConfirmNoteRequiredException() {
        super(ErrorCode.RETURN_CONFIRM_NOTE_REQUIRED);
    }
}
