package com.library.book.application.service;

import com.library.book.application.mapper.BookMapper;
import com.library.book.domain.exception.BookNotFoundException;
import com.library.book.domain.entity.Book;
import com.library.book.domain.enums.BookSortOption;
import com.library.book.infrastructure.persistence.BookRepository;
import com.library.book.presentation.dto.response.BookDetailResponse;
import com.library.book.presentation.dto.response.BookListItem;
import com.library.book.presentation.dto.response.BookListResponse;
import com.library.book.presentation.dto.response.BorrowHistoryItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookQueryService {

    private static final int PAGE_SIZE = 10;

    private final BookRepository bookRepository;
    private final BookMapper bookMapper;
    private final JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public BookListResponse listBooks(int page, String search, UUID categoryId, BookSortOption sortBy) {
        Sort sort = resolveSort(sortBy);
        Pageable pageable = PageRequest.of(page - 1, PAGE_SIZE, sort);

        String searchParam = (search != null && !search.isBlank()) ? search.trim() : null;

        Page<Book> resultPage = bookRepository.findAllFiltered(searchParam, categoryId, pageable);

        List<BookListItem> items = resultPage.getContent()
                .stream()
                .map(bookMapper::toListItem)
                .toList();

        log.debug("List books: page={}, total={}, search={}", page, resultPage.getTotalElements(), search);

        return BookListResponse.builder()
                .items(items)
                .page(page)
                .pageSize(PAGE_SIZE)
                .totalItems(resultPage.getTotalElements())
                .totalPages(resultPage.getTotalPages())
                .traceId(MDC.get("traceId"))
                .build();
    }

    @Transactional(readOnly = true)
    public BookDetailResponse getBookDetail(UUID bookId, String role) {
        Book book = bookRepository.findByIdAndNotDeleted(bookId)
                .orElseThrow(BookNotFoundException::new);

        BookDetailResponse.BookDetailResponseBuilder builder = BookDetailResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .isbn(book.getIsbn())
                .publishedYear(book.getPublishedYear())
                .description(book.getDescription())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .totalQuantity(book.getTotalQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .borrowedQuantity(book.getBorrowedQuantity())
                .borrowHistory(null)
                .canBorrow(null)
                .replacementPrice(book.getReplacementPrice())
                .depositPolicyId(book.getDepositPolicy() != null ? book.getDepositPolicy().getId() : null)
                .depositPolicyName(book.getDepositPolicy() != null ? book.getDepositPolicy().getName() : null)
                .customDepositRate(book.getCustomDepositRate())
                .effectiveDepositRate(bookMapper.calculateEffectiveRate(book))
                .imageUrl(bookMapper.buildImageUrl(book.getImageKey()));

        if ("LIBRARIAN".equals(role)) {
            List<BorrowHistoryItem> history = fetchBorrowHistory(bookId);
            builder.borrowHistory(history);
        } else if ("READER".equals(role)) {
            builder.canBorrow(book.getAvailableQuantity() > 0);
        }

        builder.traceId(MDC.get("traceId"));

        log.debug("Book detail: id={}, role={}", bookId, role);
        return builder.build();
    }

    private List<BorrowHistoryItem> fetchBorrowHistory(UUID bookId) {
        String sql = "SELECT u.name AS readerName, " +
                "br.actual_borrow_date AS borrowDate, " +
                "br.due_date AS dueDate " +
                "FROM borrow_records br " +
                "JOIN users u ON br.reader_id = u.id " +
                "WHERE br.book_id = UUID_TO_BIN(?, 0) " +
                "AND br.status IN ('BORROWING', 'OVERDUE', 'RETURNED') " +
                "ORDER BY br.actual_borrow_date DESC " +
                "LIMIT 50";

        return jdbcTemplate.query(sql, (rs, rowNum) -> BorrowHistoryItem.builder()
                .readerName(rs.getString("readerName"))
                .borrowDate(toInstant(rs.getTimestamp("borrowDate")))
                .dueDate(toInstant(rs.getTimestamp("dueDate")))
                .build(), bookId.toString());
    }

    private Sort resolveSort(BookSortOption sortBy) {
        if (sortBy == null) {
            return Sort.by(Sort.Direction.ASC, "title");
        }
        return switch (sortBy) {
            case NAME_ASC -> Sort.by(Sort.Direction.ASC, "title");
            case NEWEST_YEAR -> Sort.by(Sort.Direction.DESC, "publishedYear");
            case MOST_POPULAR -> Sort.by(Sort.Direction.DESC, "borrowedQuantity");
        };
    }

    private Instant toInstant(Timestamp ts) {
        return ts != null ? ts.toInstant() : null;
    }
}
