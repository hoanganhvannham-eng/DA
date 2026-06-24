package com.library.fine.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineLevelDTO {

    private UUID id;
    private String name;
    private BigDecimal amount;
    private BigDecimal amountPerDay;
    private BigDecimal maxAmount;
}
