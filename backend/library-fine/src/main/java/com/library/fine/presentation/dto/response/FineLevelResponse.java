package com.library.fine.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
public class FineLevelResponse {

    private final UUID id;
    private final String name;
    private final BigDecimal amount;
    private final BigDecimal amountPerDay;
    private final BigDecimal maxAmount;
    private final String fineType;
    private final LocalDate fineDate;
    private final Instant createdAt;
    private final Instant updatedAt;
}
