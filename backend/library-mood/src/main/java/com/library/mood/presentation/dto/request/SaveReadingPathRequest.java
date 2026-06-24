package com.library.mood.presentation.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
public class SaveReadingPathRequest {

    @NotNull(message = "Mood không được để trống")
    private UUID moodId;

    @NotNull(message = "Danh sách sách không được để trống")
    @Size(min = 3, max = 7, message = "Lộ trình phải có 3-7 sách")
    @Valid
    private List<SaveReadingPathItem> items;

    private Boolean confirmReplace;
}
