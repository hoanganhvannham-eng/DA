package com.library.book.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryMutationResponse {

    private final String message;
    private final CategoryResponse category;
    private final String traceId;
}
