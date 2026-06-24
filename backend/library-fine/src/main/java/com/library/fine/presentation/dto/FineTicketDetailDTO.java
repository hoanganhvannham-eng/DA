package com.library.fine.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineTicketDetailDTO {
    private UUID id;
    private String cause;
    private BigDecimal amount;
    private BigDecimal remainingAmount;
    private String status;
    private String paymentProofUrl;
    private String rejectionReason;
    private String voidReason;
    private String bookTitle;
    private String readerName;
    private UUID bookId;
    private String fineType;
    private String note;
    private UUID confirmedBy;
    private Instant confirmedAt;
    private Instant proofSubmittedAt;
    private Instant createdAt;
    private Instant updatedAt;
}
