package com.library.mood.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
public class ReadingPathDTO {

    private final UUID id;
    private final UUID readerId;
    private final UUID moodId;
    private final List<PathItemDTO> items;

    @Getter
    @Builder
    public static class PathItemDTO {
        private final UUID bookId;
        private final String title;
        private final String author;
        private final Integer order;
    }
}
