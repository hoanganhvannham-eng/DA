package com.library.wallet.domain.event;

import java.math.BigDecimal;
import java.util.UUID;

public record WalletTopUpEvent(
    UUID userId,
    BigDecimal amount
) {}
