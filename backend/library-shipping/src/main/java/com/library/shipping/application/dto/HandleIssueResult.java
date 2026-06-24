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
public class HandleIssueResult {

    private String message;

    private BorrowStatusInfo borrow;

    private ShippingOrderDTO shippingOrder;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorrowStatusInfo {
        private java.util.UUID id;
        private String status;
        private Integer deliveryAttempts;
        private String dueDate;
    }
}
