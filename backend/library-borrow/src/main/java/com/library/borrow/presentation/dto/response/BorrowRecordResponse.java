package com.library.borrow.presentation.dto.response;

import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BorrowRecordResponse {

    private UUID id;
    private UUID readerId;
    private UUID bookId;
    private BorrowStatus status;
    private Instant borrowDate;
    private Instant dueDate;
    private Integer durationDays;
    private Instant actualBorrowDate;
    private String rejectionReason;
    private UUID confirmedBy;
    private Instant confirmedAt;
    private FulfillmentMethod fulfillmentMethod;
    private String shippingAddress;
    private Integer extensionCount;
    private Integer deliveryAttemptCount;
    private String riskFlags;
    private Instant reservedUntil;
    private Instant pendingApprovalUntil;
    private Instant createdAt;
    private Instant updatedAt;
    private String message;

    // Deposit fields
    private BigDecimal depositAmount;
    private DepositStatus depositStatus;
    private Instant depositConfirmedAt;
    private UUID depositConfirmedBy;
    private String pickupCode;
    private UUID rentalRateId;
    private BigDecimal rentalFeeSnapshot;
    private BigDecimal replacementPriceSnapshot;
    private Integer depositRateSnapshot;
    private String refundMethod;

    // Display fields
    private String bookTitle;
    private String readerName;
}
