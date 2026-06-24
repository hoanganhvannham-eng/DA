package com.library.bookreturn.presentation.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BulkConfirmReturnRequest {

    @NotEmpty(message = "Danh sách đơn trả không được trống")
    @Size(max = 100, message = "Mỗi lần tối đa 100 đơn")
    private List<UUID> borrowIds;

    @NotNull(message = "Tình trạng sách không được trống")
    private String bookCondition;

    @NotNull(message = "Phương thức hoàn cọc không được để trống")
    @Pattern(regexp = "CASH|TO_WALLET", message = "Phương thức hoàn cọc phải là CASH hoặc TO_WALLET")
    private String refundMethod;
}
