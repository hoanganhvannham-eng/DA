package com.library.mood.presentation.dto.response;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Builder;
import lombok.Getter;

import java.util.List;
import java.util.UUID;

@Getter
@Builder
@JsonIgnoreProperties(ignoreUnknown = true)
public class BookMoodsResponse {

    private final List<MoodResponse> availableMoods;
    private final List<UUID> currentMoodIds;
}
