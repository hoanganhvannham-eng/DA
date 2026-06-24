package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineProofFormatInvalidException extends BusinessException {
    public FineProofFormatInvalidException() {
        super(ErrorCode.FINE_PROOF_FORMAT_INVALID);
    }
}
