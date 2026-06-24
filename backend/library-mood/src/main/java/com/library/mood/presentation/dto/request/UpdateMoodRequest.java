package com.library.mood.presentation.dto.request;

import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UpdateMoodRequest {

    @Size(max = 50, message = "Tên mood không được quá 50 ký tự")
    private String name;

    @Size(max = 255, message = "Mô tả không được quá 255 ký tự")
    private String description;
}
