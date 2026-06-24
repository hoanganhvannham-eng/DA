package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;
import lombok.Getter;

@Getter
public class BookInventoryConflictException extends BusinessException {

    private final int activeBorrowsCount;
    private final int damagedCount;
    private final int lostCount;

    public BookInventoryConflictException(int activeBorrowsCount, int damagedCount, int lostCount) {
        super(ErrorCode.BOOK_INVENTORY_CONFLICT);
        this.activeBorrowsCount = activeBorrowsCount;
        this.damagedCount = damagedCount;
        this.lostCount = lostCount;
    }

    @Override
    public Object getDetails() {
        return java.util.Map.of(
                "activeBorrowsCount", activeBorrowsCount,
                "damagedCount", damagedCount,
                "lostCount", lostCount,
                "minimumTotalQuantity", activeBorrowsCount + damagedCount + lostCount
        );
    }
}
