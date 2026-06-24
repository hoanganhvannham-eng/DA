package com.library.mood.application.mapper;

import com.library.mood.presentation.dto.response.MoodResponse;
import com.library.mood.domain.Mood;
import org.springframework.stereotype.Component;

@Component
public class MoodMapper {

    public MoodResponse toResponse(Mood mood) {
        return MoodResponse.builder()
                .id(mood.getId())
                .name(mood.getName())
                .description(mood.getDescription())
                .createdAt(mood.getCreatedAt())
                .updatedAt(mood.getUpdatedAt())
                .build();
    }
}
