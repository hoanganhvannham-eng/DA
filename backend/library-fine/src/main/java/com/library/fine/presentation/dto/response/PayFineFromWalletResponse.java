package com.library.fine.presentation.dto.response;

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
public class PayFineFromWalletResponse {
    private String message;
    private UUID fineId;
    private BigDecimal paidAmount;
    private BigDecimal remainingAmount;
    private String status;
}
