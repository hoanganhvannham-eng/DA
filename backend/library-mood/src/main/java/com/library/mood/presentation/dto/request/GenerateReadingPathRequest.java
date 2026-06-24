package com.library.mood.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class GenerateReadingPathRequest {

    @NotNull(message = "Mood không được để trống")
    private UUID moodId;
}
