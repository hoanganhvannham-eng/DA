package com.library.mood.application.dto;

import java.math.BigDecimal;
import java.util.UUID;

public record BookRecommendation(
        UUID id,
        String title,
        String author,
        String categoryName,
        BigDecimal popularityScore
) {}
