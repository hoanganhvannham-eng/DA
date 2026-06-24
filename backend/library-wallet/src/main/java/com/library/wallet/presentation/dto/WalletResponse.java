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
public class WalletResponse {
    private UUID id;
    private UUID userId;
    private BigDecimal balance;
    private BigDecimal heldAmount;
    private BigDecimal availableBalance;
    private Instant createdAt;
    private Instant updatedAt;
}
