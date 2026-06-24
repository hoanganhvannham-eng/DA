package com.library.book.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookResponse {

    private UUID id;
    private String title;
    private String author;
    private Integer publishedYear;
    private String isbn;
    private UUID categoryId;
    private String categoryName;
    private String description;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private Integer borrowedQuantity;
    private BigDecimal replacementPrice;
    private UUID depositPolicyId;
    private String depositPolicyName;
    private Integer customDepositRate;
    private Integer effectiveDepositRate;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
