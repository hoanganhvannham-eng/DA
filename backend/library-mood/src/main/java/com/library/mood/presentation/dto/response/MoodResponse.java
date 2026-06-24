package com.library.mood.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
public class MoodResponse {

    private final UUID id;
    private final String name;
    private final String description;
    private final Instant createdAt;
    private final Instant updatedAt;
}
