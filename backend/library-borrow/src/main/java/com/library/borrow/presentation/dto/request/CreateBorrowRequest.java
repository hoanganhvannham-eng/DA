package com.library.borrow.presentation.dto.request;

import com.library.borrow.domain.enums.FulfillmentMethod;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class CreateBorrowRequest {

    @NotNull(message = "bookId không được để trống")
    private UUID bookId;

    @Min(value = 1, message = "Thời hạn mượn phải từ 1–60 ngày")
    @Max(value = 60, message = "Thời hạn mượn phải từ 1–60 ngày")
    private Integer durationDays = 14;

    @NotNull(message = "Phương thức nhận sách không được để trống")
    private FulfillmentMethod fulfillmentMethod;

    private String shippingAddress;
}
