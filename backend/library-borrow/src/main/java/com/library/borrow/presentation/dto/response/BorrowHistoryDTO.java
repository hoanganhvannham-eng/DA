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
public class BorrowHistoryDTO {

    private UUID id;
    private String bookTitle;
    private String bookAuthor;
    private BorrowStatus status;
    private Instant borrowDate;
    private Instant dueDate;
    private Instant actualBorrowDate;
    private String rejectionReason;
    private FulfillmentMethod fulfillmentMethod;
    private String shippingAddress;
    private Integer extensionCount;
    private Integer remainingDays;
    private Integer overdueDays;
    private String trackingNumber;
    private String shippingStatus;
    private String riskFlags;
    private Instant reservedUntil;
    private Instant pendingApprovalUntil;
    private String returnMethod;
    private Instant returnedAt;
    private Instant createdAt;

    // Deposit fields
    private BigDecimal depositAmount;
    private DepositStatus depositStatus;
    private String pickupCode;
    private BigDecimal rentalFeeSnapshot;
    private BigDecimal replacementPriceSnapshot;
    private Integer depositRateSnapshot;
    private String refundMethod;
}
