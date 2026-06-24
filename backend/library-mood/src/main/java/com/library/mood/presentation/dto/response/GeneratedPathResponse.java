package com.library.mood.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class GeneratedPathResponse {

    private final UUID moodId;
    private final List<GeneratedBookItem> books;

    @Getter
    @Builder
    public static class GeneratedBookItem {
        private final UUID id;
        private final String title;
        private final String author;
        private final Integer order;
    }
}
