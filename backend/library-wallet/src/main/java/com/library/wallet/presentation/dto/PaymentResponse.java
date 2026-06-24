package com.library.wallet.presentation.dto;

import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private String paymentCode;
    private String gatewayUrl;
    private BigDecimal amount;
    private String status;
    private String redirectUrl;
    private Instant expiredAt;
}
