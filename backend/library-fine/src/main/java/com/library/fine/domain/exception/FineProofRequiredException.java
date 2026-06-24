package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineProofRequiredException extends BusinessException {
    public FineProofRequiredException() {
        super(ErrorCode.FINE_PROOF_REQUIRED);
    }
}
