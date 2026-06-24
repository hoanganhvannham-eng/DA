package com.library.wallet.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class WalletNotFoundException extends BusinessException {
    public WalletNotFoundException() {
        super(ErrorCode.WALLET_NOT_FOUND);
    }
}
