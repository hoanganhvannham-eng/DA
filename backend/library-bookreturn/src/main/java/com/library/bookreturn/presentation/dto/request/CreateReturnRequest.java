package com.library.bookreturn.presentation.dto.request;

import com.library.bookreturn.domain.enums.ReturnMethod;
import com.library.bookreturn.domain.validation.ReturnMethodConstraint;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@ReturnMethodConstraint
public class CreateReturnRequest {

    @NotNull(message = "borrowRecordId không được để trống")
    private UUID borrowRecordId;

    @NotNull(message = "Phương thức trả không được để trống")
    private ReturnMethod returnMethod;

    @Size(max = 255, message = "Địa chỉ tối đa 255 ký tự")
    private String pickupAddress;

    private boolean staffOverride = false;
}
