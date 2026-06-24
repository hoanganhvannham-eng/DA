package com.library.bookreturn.presentation.dto.response;

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
public class CreateReturnShipmentResponse {

    private String message;
    private ShippingOrderDto shippingOrder;
    private BorrowRecordDto borrow;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ShippingOrderDto {
        private UUID id;
        private String trackingNumber;
        @Builder.Default private String type = "RETURN";
        private String status;
        private String shippingAddress;
        private Integer attemptNumber;
        private Instant createdAt;
    }

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorrowRecordDto {
        private UUID id;
        private String status;
    }
}
