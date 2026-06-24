package com.library.mood.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class RecommendationsResponse {

    private final List<RecommendationDTO> suggestions;
    private final String message;
}
