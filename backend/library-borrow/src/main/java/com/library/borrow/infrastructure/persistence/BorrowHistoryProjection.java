package com.library.borrow.infrastructure.persistence;

import java.math.BigDecimal;
import java.time.Instant;

public interface BorrowHistoryProjection {

    byte[] getId();

    String getBookTitle();

    String getBookAuthor();

    String getStatus();

    Instant getBorrowDate();

    Instant getDueDate();

    Instant getActualBorrowDate();

    String getRejectionReason();

    String getFulfillmentMethod();

    String getShippingAddress();

    Integer getExtensionCount();

    String getTrackingNumber();

    String getShippingStatus();

    String getRiskFlags();

    Instant getReservedUntil();

    Instant getPendingApprovalUntil();

    String getReturnMethod();

    Instant getReturnedAt();

    Instant getCreatedAt();

    // Deposit fields
    BigDecimal getDepositAmount();

    String getDepositStatus();

    String getPickupCode();

    BigDecimal getRentalFeeSnapshot();

    BigDecimal getReplacementPriceSnapshot();

    Integer getDepositRateSnapshot();

    String getRefundMethod();
}
