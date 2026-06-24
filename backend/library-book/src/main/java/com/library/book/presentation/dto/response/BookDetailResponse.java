package com.library.book.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookDetailResponse {

    private UUID id;
    private String title;
    private String author;
    private String isbn;
    private Integer publishedYear;
    private String description;

    private UUID categoryId;
    private String categoryName;

    private Integer totalQuantity;
    private Integer availableQuantity;
    private Integer borrowedQuantity;

    private List<BorrowHistoryItem> borrowHistory;

    private Boolean canBorrow;

    private String traceId;

    // Deposit fields
    private BigDecimal replacementPrice;
    private UUID depositPolicyId;
    private String depositPolicyName;
    private Integer customDepositRate;
    private Integer effectiveDepositRate;
    private String imageUrl;
}
