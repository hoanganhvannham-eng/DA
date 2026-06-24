package com.library.fine.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineTicketDTO {
    private UUID id;
    private String cause;
    private BigDecimal amount;
    private BigDecimal remainingAmount;
    private LocalDate fineDate;
    private String status;
    private String paymentProofUrl;
    private String rejectionReason;
    private String fineType;
    private String voidReason;
    private Instant proofSubmittedAt;
    private Instant createdAt;
}
