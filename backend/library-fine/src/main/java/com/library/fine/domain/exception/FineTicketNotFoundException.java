package com.library.fine.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class FineTicketNotFoundException extends BusinessException {
    public FineTicketNotFoundException() {
        super(ErrorCode.FINE_TICKET_NOT_FOUND);
    }
}
