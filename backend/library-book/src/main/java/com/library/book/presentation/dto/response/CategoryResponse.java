package com.library.book.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class CategoryResponse {

    private final UUID id;
    private final String name;
    private final Instant createdAt;
    private final Instant updatedAt;
}
