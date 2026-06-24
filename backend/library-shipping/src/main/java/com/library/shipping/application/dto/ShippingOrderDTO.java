package com.library.shipping.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShippingOrderDTO {

    private UUID id;
    private String trackingNumber;
    private String type;
    private String status;
    private String shippingAddress;
    private Integer attemptNumber;
    private Instant estimatedDeliveryDate;
    private Instant createdAt;
}
