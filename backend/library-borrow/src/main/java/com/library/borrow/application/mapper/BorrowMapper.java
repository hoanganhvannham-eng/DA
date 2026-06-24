package com.library.borrow.application.mapper;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.presentation.dto.response.BorrowRecordResponse;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class BorrowMapper {

    private final ObjectMapper objectMapper;

    public BorrowMapper(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public BorrowRecordResponse toResponse(BorrowRecord record) {
        return BorrowRecordResponse.builder()
                .id(record.getId())
                .readerId(record.getReaderId())
                .bookId(record.getBookId())
                .status(record.getStatus())
                .borrowDate(record.getBorrowDate())
                .dueDate(record.getDueDate())
                .durationDays(record.getDurationDays())
                .actualBorrowDate(record.getActualBorrowDate())
                .rejectionReason(record.getRejectionReason())
                .confirmedBy(record.getConfirmedBy())
                .confirmedAt(record.getConfirmedAt())
                .fulfillmentMethod(record.getFulfillmentMethod())
                .shippingAddress(record.getShippingAddress())
                .extensionCount(record.getExtensionCount())
                .deliveryAttemptCount(record.getDeliveryAttemptCount())
                .riskFlags(toRiskFlagsString(record.getRiskFlags()))
                .reservedUntil(record.getReservedUntil())
                .pendingApprovalUntil(record.getPendingApprovalUntil())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .depositAmount(record.getDepositAmount())
                .depositStatus(record.getDepositStatus())
                .depositConfirmedAt(record.getDepositConfirmedAt())
                .depositConfirmedBy(record.getDepositConfirmedBy())
                .pickupCode(record.getPickupCode())
                .rentalRateId(record.getRentalRateId())
                .rentalFeeSnapshot(record.getRentalFeeSnapshot())
                .replacementPriceSnapshot(record.getReplacementPriceSnapshot())
                .depositRateSnapshot(record.getDepositRateSnapshot())
                .refundMethod(record.getRefundMethod())
                .build();
    }

    private String toRiskFlagsString(List<String> flags) {
        if (flags == null) return null;
        try {
            return objectMapper.writeValueAsString(flags);
        } catch (JsonProcessingException e) {
            return null;
        }
    }
}
