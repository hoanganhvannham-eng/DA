package com.library.bookreturn.presentation.dto.request;

import com.library.bookreturn.domain.enums.BookCondition;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class ConfirmReturnRequest {

    @NotNull(message = "Tình trạng sách không được để trống")
    private BookCondition bookCondition;

    private UUID fineLevelId;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String note;

    @NotNull(message = "Phương thức hoàn cọc không được để trống")
    @Pattern(regexp = "CASH|TO_WALLET", message = "Phương thức hoàn cọc phải là CASH hoặc TO_WALLET")
    private String refundMethod;
}
