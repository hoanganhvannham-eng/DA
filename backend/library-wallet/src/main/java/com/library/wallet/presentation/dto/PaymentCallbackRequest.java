package com.library.wallet.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentCallbackRequest {
    @NotBlank(message = "Mã giao dịch không được để trống")
    private String paymentCode;

    @NotBlank(message = "Kết quả không được để trống")
    private String result;
}
