package com.library.borrow.application.service;

import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.borrow.infrastructure.persistence.BorrowHistoryProjection;
import com.library.borrow.presentation.dto.response.BorrowHistoryDTO;
import com.library.borrow.presentation.dto.response.BorrowHistoryResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BorrowQueryService {

    private final BorrowRecordRepository borrowRecordRepository;

    @Transactional(readOnly = true)
    public BorrowHistoryResponse getBorrowHistory(UUID readerId, String statusFilter, int page, int size) {
        if (readerId == null) {
            log.warn("getBorrowHistory called with null readerId");
            return BorrowHistoryResponse.builder()
                    .data(List.of())
                    .page(page)
                    .size(size)
                    .total(0)
                    .totalPages(0)
                    .build();
        }

        String statusParam = (statusFilter != null && !statusFilter.isBlank())
                ? statusFilter.toUpperCase()
                : null;

        byte[] readerIdBytes = uuidToBytes(readerId);

        List<BorrowHistoryProjection> projections;
        long total;
        try {
            Page<BorrowHistoryProjection> resultPage = borrowRecordRepository.findBorrowHistoryRaw(
                    readerIdBytes, statusParam, PageRequest.of(page, size));
            projections = resultPage.getContent();
            total = resultPage.getTotalElements();
        } catch (DataAccessException e) {
            log.error("Database error while fetching borrow history: readerId={}, status={}",
                    readerId, statusFilter, e);
            throw new IllegalStateException("Failed to retrieve borrow history", e);
        }

        List<BorrowHistoryDTO> dtos = new ArrayList<>(projections.size());
        for (BorrowHistoryProjection proj : projections) {
            dtos.add(mapProjection(proj));
        }

        int totalPages = (int) Math.ceil((double) total / size);

        log.info("Borrow history: readerId={}, status={}, page={}, size={}, total={}",
                readerId, statusFilter, page, size, total);

        return BorrowHistoryResponse.builder()
                .data(dtos)
                .page(page)
                .size(size)
                .total(total)
                .totalPages(totalPages)
                .build();
    }

    private BorrowHistoryDTO mapProjection(BorrowHistoryProjection proj) {
        UUID id = convertBytesToUUID(proj.getId());
        BorrowStatus status = proj.getStatus() != null ? BorrowStatus.valueOf(proj.getStatus()) : null;
        FulfillmentMethod fulfillmentMethod = proj.getFulfillmentMethod() != null
                ? FulfillmentMethod.valueOf(proj.getFulfillmentMethod())
                : null;
        DepositStatus depositStatus = proj.getDepositStatus() != null
                ? DepositStatus.valueOf(proj.getDepositStatus())
                : null;

        Integer remainingDays = computeRemainingDays(status, proj.getDueDate());
        Integer overdueDays = computeOverdueDays(status, proj.getDueDate());

        return BorrowHistoryDTO.builder()
                .id(id)
                .bookTitle(proj.getBookTitle())
                .bookAuthor(proj.getBookAuthor())
                .status(status)
                .borrowDate(proj.getBorrowDate())
                .dueDate(proj.getDueDate())
                .actualBorrowDate(proj.getActualBorrowDate())
                .rejectionReason(proj.getRejectionReason())
                .fulfillmentMethod(fulfillmentMethod)
                .shippingAddress(proj.getShippingAddress())
                .extensionCount(proj.getExtensionCount() != null ? proj.getExtensionCount() : 0)
                .remainingDays(remainingDays)
                .overdueDays(overdueDays)
                .trackingNumber(proj.getTrackingNumber())
                .shippingStatus(proj.getShippingStatus())
                .riskFlags(proj.getRiskFlags())
                .reservedUntil(proj.getReservedUntil())
                .pendingApprovalUntil(proj.getPendingApprovalUntil())
                .returnMethod(proj.getReturnMethod())
                .returnedAt(proj.getReturnedAt())
                .createdAt(proj.getCreatedAt())
                .depositAmount(proj.getDepositAmount())
                .depositStatus(depositStatus)
                .pickupCode(proj.getPickupCode())
                .rentalFeeSnapshot(proj.getRentalFeeSnapshot())
                .replacementPriceSnapshot(proj.getReplacementPriceSnapshot())
                .depositRateSnapshot(proj.getDepositRateSnapshot())
                .refundMethod(proj.getRefundMethod())
                .build();
    }

    private Integer computeRemainingDays(BorrowStatus status, Instant dueDate) {
        if (status == BorrowStatus.BORROWING && dueDate != null) {
            long days = ChronoUnit.DAYS.between(Instant.now(), dueDate);
            return (int) days;
        }
        return null;
    }

    private Integer computeOverdueDays(BorrowStatus status, Instant dueDate) {
        if (status == BorrowStatus.OVERDUE && dueDate != null) {
            long days = ChronoUnit.DAYS.between(dueDate, Instant.now());
            return Math.max(1, (int) days);
        }
        return null;
    }

    private byte[] uuidToBytes(UUID uuid) {
        long msb = uuid.getMostSignificantBits();
        long lsb = uuid.getLeastSignificantBits();
        byte[] bytes = new byte[16];
        for (int i = 0; i < 8; i++) {
            bytes[i] = (byte) (msb >>> (8 * (7 - i)));
        }
        for (int i = 0; i < 8; i++) {
            bytes[8 + i] = (byte) (lsb >>> (8 * (7 - i)));
        }
        return bytes;
    }

    private UUID convertBytesToUUID(byte[] bytes) {
        if (bytes == null || bytes.length != 16) return null;
        long msb = 0;
        long lsb = 0;
        for (int i = 0; i < 8; i++) msb = (msb << 8) | (bytes[i] & 0xff);
        for (int i = 8; i < 16; i++) lsb = (lsb << 8) | (bytes[i] & 0xff);
        return new UUID(msb, lsb);
    }
}
