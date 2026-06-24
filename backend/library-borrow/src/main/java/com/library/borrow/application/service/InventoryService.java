package com.library.borrow.application.service;

import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.exception.BorrowOutOfStockException;
import com.library.borrow.domain.port.BookRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final BookRepository bookRepository;

    @Transactional
    public boolean softLockStock(UUID bookId) {
        bookRepository.findByIdNotDeleted(bookId)
                .orElseThrow(() -> {
                    log.warn("Soft-lock failed: book not found or deleted id={}", bookId);
                    return new BorrowNotFoundException();
                });

        int available = bookRepository.getAvailableQuantityForUpdate(bookId);
        if (available <= 0) {
            log.warn("Soft-lock failed: out of stock bookId={}, available={}", bookId, available);
            throw new BorrowOutOfStockException();
        }

        boolean wasLastCopy = (available == 1);
        bookRepository.decrementStockForUpdate(bookId);
        log.info("Soft-lock success: bookId={}, wasLastCopy={}, availableBefore={}", bookId, wasLastCopy, available);
        return wasLastCopy;
    }

    @Transactional(readOnly = true)
    public boolean isLastCopy(UUID bookId) {
        return bookRepository.findByIdNotDeleted(bookId)
                .map(book -> book.getAvailableQuantity() == 1)
                .orElse(false);
    }

    @Transactional
    public void restoreStock(UUID bookId) {
        bookRepository.findByIdNotDeleted(bookId)
                .orElseThrow(() -> {
                    log.warn("Restore stock failed: book not found id={}", bookId);
                    return new BorrowNotFoundException();
                });
        bookRepository.incrementStock(bookId);
        log.info("Stock restored: bookId={}", bookId);
    }

    @Transactional
    public void transferToBorrowed(UUID bookId) {
        bookRepository.findByIdNotDeleted(bookId)
                .orElseThrow(() -> {
                    log.warn("Transfer to borrowed failed: book not found id={}", bookId);
                    return new BorrowNotFoundException();
                });
        bookRepository.incrementBorrowedQuantity(bookId);
        log.info("Transferred to borrowed: bookId={}", bookId);
    }
}
