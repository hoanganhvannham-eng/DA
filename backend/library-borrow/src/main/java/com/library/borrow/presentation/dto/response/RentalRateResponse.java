package com.library.borrow.presentation.dto.response;

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
public class RentalRateResponse {

    private UUID id;
    private String name;
    private Integer minDays;
    private Integer maxDays;
    private BigDecimal fee;
}
