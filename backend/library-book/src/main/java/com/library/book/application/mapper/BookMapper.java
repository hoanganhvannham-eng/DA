package com.library.book.application.mapper;

import com.library.book.domain.entity.Book;
import com.library.book.presentation.dto.response.BookListItem;
import com.library.book.presentation.dto.response.BookResponse;
import org.springframework.stereotype.Component;

@Component
public class BookMapper {

    public BookResponse toResponse(Book book) {
        return BookResponse.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publishedYear(book.getPublishedYear())
                .isbn(book.getIsbn())
                .categoryId(book.getCategory() != null ? book.getCategory().getId() : null)
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .description(book.getDescription())
                .totalQuantity(book.getTotalQuantity())
                .availableQuantity(book.getAvailableQuantity())
                .borrowedQuantity(book.getBorrowedQuantity())
                .replacementPrice(book.getReplacementPrice())
                .depositPolicyId(book.getDepositPolicy() != null ? book.getDepositPolicy().getId() : null)
                .depositPolicyName(book.getDepositPolicy() != null ? book.getDepositPolicy().getName() : null)
                .customDepositRate(book.getCustomDepositRate())
                .effectiveDepositRate(calculateEffectiveRate(book))
                .imageUrl(buildImageUrl(book.getImageKey()))
                .createdAt(book.getCreatedAt())
                .updatedAt(book.getUpdatedAt())
                .build();
    }

    public BookListItem toListItem(Book book) {
        return BookListItem.builder()
                .id(book.getId())
                .title(book.getTitle())
                .author(book.getAuthor())
                .publishedYear(book.getPublishedYear())
                .categoryName(book.getCategory() != null ? book.getCategory().getName() : null)
                .availableQuantity(book.getAvailableQuantity())
                .borrowedQuantity(book.getBorrowedQuantity())
                .replacementPrice(book.getReplacementPrice())
                .depositPolicyId(book.getDepositPolicy() != null ? book.getDepositPolicy().getId() : null)
                .depositPolicyName(book.getDepositPolicy() != null ? book.getDepositPolicy().getName() : null)
                .customDepositRate(book.getCustomDepositRate())
                .effectiveDepositRate(calculateEffectiveRate(book))
                .imageUrl(buildImageUrl(book.getImageKey()))
                .build();
    }

    public String buildImageUrl(String imageKey) {
        if (imageKey == null || imageKey.isBlank()) return null;
        return "/uploads/covers/" + imageKey;
    }

    public Integer calculateEffectiveRate(Book book) {
        if (book.getCustomDepositRate() != null) {
            return book.getCustomDepositRate();
        }
        return book.getDepositPolicy() != null ? book.getDepositPolicy().getDepositRate() : 70;
    }
}
