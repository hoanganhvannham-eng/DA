package com.library.fine.presentation.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
public class CreateFineLevelRequest {

    @NotBlank(message = "Tên mức phạt không được để trống")
    @Size(max = 25, message = "Tên mức phạt không được quá 25 ký tự")
    private String name;

    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal amount;

    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal amountPerDay;

    @DecimalMin(value = "0.01", message = "Số tiền phải lớn hơn 0")
    private BigDecimal maxAmount;

    private LocalDate fineDate;

    @Pattern(regexp = "^(ALL|OVERDUE|DAMAGED|LOST)$", message = "Loại phạt không hợp lệ")
    private String fineType;
}
