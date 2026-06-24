package com.library.book.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class CategoryListResponse {

    private final List<CategoryResponse> categories;
    private final String traceId;
}
