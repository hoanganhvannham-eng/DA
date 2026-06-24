package com.library.wallet.presentation.dto;

import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopUpResponse {
    private BigDecimal amount;
    private BigDecimal newBalance;
    private String message;
}
