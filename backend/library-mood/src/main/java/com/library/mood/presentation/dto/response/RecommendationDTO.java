package com.library.mood.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.UUID;

@Getter
@Builder
public class RecommendationDTO {

    private final UUID id;
    private final String title;
    private final String author;
    private final String categoryName;
    private final BigDecimal popularityScore;
}
