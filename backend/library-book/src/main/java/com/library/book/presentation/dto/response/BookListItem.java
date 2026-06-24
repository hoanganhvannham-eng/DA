package com.library.book.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookListItem {

    private UUID id;
    private String title;
    private String author;
    private Integer publishedYear;
    private String categoryName;
    private Integer availableQuantity;
    private Integer borrowedQuantity;

    // Deposit fields
    private BigDecimal replacementPrice;
    private UUID depositPolicyId;
    private String depositPolicyName;
    private Integer customDepositRate;
    private Integer effectiveDepositRate;
    private String imageUrl;
}
