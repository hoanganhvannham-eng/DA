package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.exception.InvalidStatusTransitionException;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.presentation.dto.request.ReportIssueRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryConfirmationService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final NotificationService notificationService;

    @Transactional
    public Map<String, Object> confirmDeliveryReceived(UUID borrowId, UUID readerId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Confirm delivery failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (!record.getReaderId().equals(readerId)) {
            log.warn("Confirm delivery failed: borrow id={} does not belong to readerId={}", borrowId, readerId);
            return Map.of(
                    "message", "Không tìm thấy đơn mượn",
                    "borrow", Map.of("id", borrowId, "status", record.getStatus().name())
            );
        }

        if (record.getStatus() == BorrowStatus.BORROWING) {
            log.info("Confirm delivery idempotent: borrow id={} already BORROWING", borrowId);
            return buildResponse(record, "Đã xác nhận trước đó");
        }

        if (record.getStatus() != BorrowStatus.DELIVERED_PENDING) {
            log.warn("Invalid status transition for confirmDelivery: borrowId={}, currentStatus={}",
                    borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        Instant now = Instant.now();
        record.setStatus(BorrowStatus.BORROWING);
        record.setActualBorrowDate(now);
        record.setDueDate(now.plus(record.getDurationDays(), ChronoUnit.DAYS));

        bookRepository.incrementBorrowedQuantity(record.getBookId());

        borrowRecordRepository.save(record);

        log.info("Delivery confirmed: borrowId={}, readerId={}, dueDate={}", borrowId, readerId, record.getDueDate());

        return buildResponse(record, "Xác nhận nhận sách thành công");
    }

    @Transactional
    public Map<String, Object> reportDeliveryIssue(UUID borrowId, UUID readerId, ReportIssueRequest request) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Report issue failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (!record.getReaderId().equals(readerId)) {
            log.warn("Report issue failed: borrow id={} does not belong to readerId={}", borrowId, readerId);
            return Map.of(
                    "message", "Không tìm thấy đơn mượn",
                    "borrow", Map.of("id", borrowId, "status", record.getStatus().name())
            );
        }

        if (record.getStatus() == BorrowStatus.DELIVERY_ISSUE) {
            log.info("Report issue idempotent: borrow id={} already DELIVERY_ISSUE", borrowId);
            return buildResponse(record, "Đã gửi báo cáo vấn đề trước đó");
        }

        if (record.getStatus() != BorrowStatus.DELIVERED_PENDING) {
            log.warn("Invalid status transition for reportIssue: borrowId={}, currentStatus={}",
                    borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        String sanitizedDescription = HtmlUtils.htmlEscape(request.getIssueDescription());
        record.setStatus(BorrowStatus.DELIVERY_ISSUE);
        record.setIssueDescription(sanitizedDescription);
        record.setIssueType(request.getIssueType() != null
                ? HtmlUtils.htmlEscape(request.getIssueType()) : null);

        borrowRecordRepository.save(record);

        notificationService.notifyLibrarian(
                "Độc giả báo chưa nhận sách (mô tả: " + sanitizedDescription + ")", borrowId);

        log.info("Delivery issue reported: borrowId={}, readerId={}, issueDesc={}",
                borrowId, readerId, request.getIssueDescription());

        return buildResponse(record, "Đã gửi báo cáo vấn đề");
    }

    private Map<String, Object> buildResponse(BorrowRecord record, String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", message);

        Map<String, Object> borrowInfo = new HashMap<>();
        borrowInfo.put("id", record.getId());
        borrowInfo.put("status", record.getStatus().name());
        if (record.getDueDate() != null) {
            borrowInfo.put("dueDate", record.getDueDate().toString());
        }
        if (record.getStatus() == BorrowStatus.DELIVERY_ISSUE) {
            borrowInfo.put("issueDescription", record.getIssueDescription());
        }
        response.put("borrow", borrowInfo);

        return response;
    }
}
