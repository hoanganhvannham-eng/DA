package com.library.shipping.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateShipmentResult {

    private String message;
    private ShippingOrderDTO shippingOrder;
    private BorrowStatusInfo borrow;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorrowStatusInfo {
        private java.util.UUID id;
        private String status;
    }
}
