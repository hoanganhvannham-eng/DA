package com.library.book.application.service;

import com.library.book.application.mapper.BookMapper;
import com.library.book.domain.exception.BookHasActiveBorrowsException;
import com.library.book.domain.exception.BookInventoryConflictException;
import com.library.book.domain.exception.BookNotFoundException;
import com.library.book.domain.exception.CategoryNotFoundException;
import com.library.book.domain.exception.IsbnAlreadyExistsException;
import com.library.book.domain.entity.Book;
import com.library.book.domain.entity.Category;
import com.library.book.domain.entity.DepositPolicy;
import com.library.book.infrastructure.persistence.BookRepository;
import com.library.book.infrastructure.persistence.CategoryRepository;
import com.library.book.infrastructure.persistence.BookDepositPolicyRepository;
import com.library.book.presentation.dto.request.BookRequest;
import com.library.book.presentation.dto.response.BookMutationResponse;
import com.library.book.presentation.dto.response.MessageResponse;
import com.library.common.storage.StorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;
    private final BookDepositPolicyRepository bookDepositPolicyRepository;
    private final BookMapper bookMapper;
    private final StorageService storageService;

    @Transactional
    public BookMutationResponse createBook(BookRequest request) {
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(CategoryNotFoundException::new);

        DepositPolicy depositPolicy = bookDepositPolicyRepository.findByIdAndIsActiveTrue(request.getDepositPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Chính sách cọc không hợp lệ"));

        if (request.getIsbn() != null && !request.getIsbn().isBlank()) {
            String normalizedIsbn = normalizeIsbn(request.getIsbn());
            if (bookRepository.countByIsbnAndNotDeleted(normalizedIsbn) > 0) {
                log.warn("ISBN already exists: '{}'", normalizedIsbn);
                throw new IsbnAlreadyExistsException();
            }
        }

        Book book = new Book();
        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setPublishedYear(request.getPublishedYear());
        book.setIsbn(request.getIsbn() != null && !request.getIsbn().isBlank()
                ? normalizeIsbn(request.getIsbn()) : null);
        book.setCategory(category);
        book.setDescription(request.getDescription().trim());
        book.setTotalQuantity(request.getTotalQuantity());
        book.setAvailableQuantity(request.getTotalQuantity());
        book.setBorrowedQuantity(0);
        book.setDamagedCount(0);
        book.setLostCount(0);
        book.setReplacementPrice(request.getReplacementPrice());
        book.setDepositPolicy(depositPolicy);
        book.setCustomDepositRate(request.getCustomDepositRate());
        book.setIsDeleted(false);

        Book saved = bookRepository.save(book);
        log.info("Book created: id={}, title='{}', isbn='{}'", saved.getId(), saved.getTitle(), saved.getIsbn());

        return BookMutationResponse.builder()
                .message("Thêm sách thành công")
                .book(bookMapper.toResponse(saved))
                .traceId(MDC.get("traceId"))
                .build();
    }

    @Transactional
    public BookMutationResponse updateBook(UUID bookId, BookRequest request) {
        Book book = bookRepository.findByIdAndNotDeleted(bookId)
                .orElseThrow(BookNotFoundException::new);

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(CategoryNotFoundException::new);

        DepositPolicy depositPolicy = bookDepositPolicyRepository.findByIdAndIsActiveTrue(request.getDepositPolicyId())
                .orElseThrow(() -> new IllegalArgumentException("Chính sách cọc không hợp lệ"));

        int activeBorrows = bookRepository.countNonTerminalBorrowsByBookId(bookId.toString());
        int damaged = book.getDamagedCount();
        int lost = book.getLostCount();
        int newTotal = request.getTotalQuantity();

        if (newTotal < activeBorrows + damaged + lost) {
            log.warn("Inventory conflict: bookId={}, newTotal={}, activeBorrows={}, damaged={}, lost={}",
                    bookId, newTotal, activeBorrows, damaged, lost);
            throw new BookInventoryConflictException(activeBorrows, damaged, lost);
        }

        if (request.getIsbn() != null && !request.getIsbn().isBlank()) {
            String normalizedIsbn = normalizeIsbn(request.getIsbn());
            if (bookRepository.countByIsbnAndNotDeletedExcludingId(normalizedIsbn, bookId) > 0) {
                log.warn("ISBN belongs to another book: '{}', bookId={}", normalizedIsbn, bookId);
                throw new IsbnAlreadyExistsException();
            }
            book.setIsbn(normalizedIsbn);
        } else {
            book.setIsbn(null);
        }

        book.setTitle(request.getTitle().trim());
        book.setAuthor(request.getAuthor().trim());
        book.setPublishedYear(request.getPublishedYear());
        book.setCategory(category);
        book.setDescription(request.getDescription().trim());
        book.setTotalQuantity(newTotal);
        book.setReplacementPrice(request.getReplacementPrice());
        book.setDepositPolicy(depositPolicy);
        book.setCustomDepositRate(request.getCustomDepositRate());

        book.setAvailableQuantity(newTotal - activeBorrows - damaged - lost);

        Book saved = bookRepository.save(book);
        log.info("Book updated: id={}, title='{}', newTotal={}, newAvailable={}",
                saved.getId(), saved.getTitle(), newTotal, saved.getAvailableQuantity());

        return BookMutationResponse.builder()
                .message("Cập nhật sách thành công")
                .book(bookMapper.toResponse(saved))
                .traceId(MDC.get("traceId"))
                .build();
    }

    @Transactional
    public MessageResponse deleteBook(UUID bookId) {
        Book book = bookRepository.findByIdAndNotDeleted(bookId)
                .orElseThrow(BookNotFoundException::new);

        int activeBorrows = bookRepository.countNonTerminalBorrowsByBookId(bookId.toString());
        if (activeBorrows > 0) {
            log.warn("Cannot delete book id={} — has {} active borrow(s)", bookId, activeBorrows);
            throw new BookHasActiveBorrowsException(activeBorrows);
        }

        book.setIsDeleted(true);
        bookRepository.save(book);
        log.info("Book soft-deleted: id={}, title='{}'", bookId, book.getTitle());

        return MessageResponse.builder()
                .message("Xóa sách thành công")
                .traceId(MDC.get("traceId"))
                .build();
    }

    @Transactional
    public String updateCover(UUID bookId, MultipartFile file) {
        Book book = bookRepository.findByIdAndNotDeleted(bookId)
                .orElseThrow(BookNotFoundException::new);

        String newKey = storageService.upload(file, "covers");

        String oldKey = book.getImageKey();
        book.setImageKey(newKey);
        bookRepository.save(book);

        if (oldKey != null) {
            storageService.delete(oldKey, "covers");
        }

        log.info("Book cover updated: id={}, oldKey='{}', newKey='{}'", bookId, oldKey, newKey);
        return bookMapper.buildImageUrl(newKey);
    }

    @Transactional
    public void deleteCover(UUID bookId) {
        Book book = bookRepository.findByIdAndNotDeleted(bookId)
                .orElseThrow(BookNotFoundException::new);

        String oldKey = book.getImageKey();
        book.setImageKey(null);
        bookRepository.save(book);

        if (oldKey != null) {
            storageService.delete(oldKey, "covers");
        }

        log.info("Book cover removed: id={}, key='{}'", bookId, oldKey);
    }

    private String normalizeIsbn(String isbn) {
        return isbn.replaceAll("[\\s-]", "").toUpperCase();
    }
}
