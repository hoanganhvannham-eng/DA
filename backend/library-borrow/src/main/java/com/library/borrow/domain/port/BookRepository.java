package com.library.borrow.domain.port;

import com.library.book.domain.entity.Book;

import java.math.BigDecimal;
import java.util.Optional;
import java.util.UUID;

public interface BookRepository {

    Optional<Book> findByIdNotDeleted(UUID bookId);

    int getAvailableQuantityForUpdate(UUID bookId);

    void decrementStockForUpdate(UUID bookId);

    void incrementStock(UUID bookId);

    void incrementBorrowedQuantity(UUID bookId);

    void incrementLostCount(UUID bookId);

    void decrementAvailableQuantity(UUID bookId);

    record BookDepositInfo(
        UUID bookId,
        BigDecimal replacementPrice,
        UUID depositPolicyId,
        BigDecimal customDepositRate
    ) {}

    Optional<BookDepositInfo> findDepositInfoByBookId(UUID bookId);
}
