package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class ProviderUnavailableException extends BusinessException {

    public ProviderUnavailableException() {
        super(ErrorCode.SHIPPING_PROVIDER_UNAVAILABLE);
    }
}
