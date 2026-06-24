package com.library.book.domain.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.exception.BusinessException;
import lombok.Getter;

@Getter
public class BookHasActiveBorrowsException extends BusinessException {

    private final int activeBorrowsCount;

    public BookHasActiveBorrowsException(int activeBorrowsCount) {
        super(ErrorCode.BOOK_HAS_ACTIVE_BORROWS);
        this.activeBorrowsCount = activeBorrowsCount;
    }

    @Override
    public Object getDetails() {
        return java.util.Map.of(
                "activeBorrowsCount", activeBorrowsCount
        );
    }
}
