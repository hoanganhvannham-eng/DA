package com.library.wallet.presentation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionHistoryResponse {
    private UUID id;
    private BigDecimal amount;
    private String type;
    private String referenceType;
    private UUID referenceId;
    private String description;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private BigDecimal heldBefore;
    private BigDecimal heldAfter;
    private Instant createdAt;
}
