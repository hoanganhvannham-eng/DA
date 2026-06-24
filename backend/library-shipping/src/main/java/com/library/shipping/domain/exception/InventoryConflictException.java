package com.library.shipping.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;

public class InventoryConflictException extends BusinessException {

    public InventoryConflictException() {
        super(ErrorCode.SHIPPING_INVENTORY_CONFLICT);
    }
}
