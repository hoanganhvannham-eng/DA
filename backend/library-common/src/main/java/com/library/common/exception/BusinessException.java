package com.library.common.exception;

import com.library.common.constants.ErrorCode;
import lombok.Getter;

/**
 * Base exception for all business-rule violations in the system.
 * Each subclass maps to a specific {@link ErrorCode} with its HTTP status and message.
 *
 * <p>Subclasses should call {@code super(ErrorCode.XXX)} in their constructor.
 * The {@link com.library.common.exception.GlobalExceptionHandler} uses
 * the error code to build the API error response.</p>
 */
@Getter
public abstract class BusinessException extends RuntimeException {

    private final ErrorCode errorCode;

    protected BusinessException(ErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    protected BusinessException(ErrorCode errorCode, String customMessage) {
        super(customMessage);
        this.errorCode = errorCode;
    }

    public Object getDetails() {
        return null;
    }
}
