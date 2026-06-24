package com.library.bookreturn.presentation.dto.request;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ResolveReturnLostRequest {

    @NotNull(message = "Hướng xử lý không được để trống")
    private String resolution;

    private UUID fineLevelId;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;
}
