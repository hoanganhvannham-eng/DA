package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineProofTooLargeException extends BusinessException {
    public FineProofTooLargeException() {
        super(ErrorCode.FINE_PROOF_TOO_LARGE);
    }
}
