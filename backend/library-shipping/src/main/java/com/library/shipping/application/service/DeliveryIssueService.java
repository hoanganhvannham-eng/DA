package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.dto.DeliveryIssueDTO;
import com.library.shipping.application.dto.HandleIssueResult;
import com.library.shipping.domain.enums.DeliveryIssueAction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DeliveryIssueService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final ShippingIssueHandlerService shippingIssueHandlerService;

    @Transactional(readOnly = true)
    public Page<DeliveryIssueDTO> getDeliveryIssues(Pageable pageable) {
        List<BorrowStatus> statuses = List.of(
                BorrowStatus.DELIVERY_ISSUE,
                BorrowStatus.DELIVERY_FAILED,
                BorrowStatus.DELIVERY_LOST);
        return borrowRecordRepository.findByStatusIn(statuses, pageable)
                .map(this::toDeliveryIssueDTO);
    }

    private DeliveryIssueDTO toDeliveryIssueDTO(BorrowRecord record) {
        return DeliveryIssueDTO.builder()
                .id(record.getId())
                .readerId(record.getReaderId())
                .bookId(record.getBookId())
                .status(record.getStatus().name())
                .deliveryAttemptCount(record.getDeliveryAttemptCount())
                .issueType(record.getIssueType())
                .issueDescription(record.getIssueDescription())
                .librarianNote(record.getLibrarianNote())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }

    public HandleIssueResult handle(UUID borrowId, String action, String notes, UUID replacementBookId) {
        DeliveryIssueAction resolvedAction;
        try {
            resolvedAction = DeliveryIssueAction.valueOf(action);
        } catch (IllegalArgumentException e) {
            log.warn("Unknown delivery issue action: {}", action);
            throw new IllegalArgumentException("Hành động không hợp lệ: " + action);
        }

        return switch (resolvedAction) {
            case REDELIVER -> shippingIssueHandlerService.scheduleRedelivery(borrowId);
            case CONFIRM_DELIVERED -> {
                if (notes == null || notes.isBlank()) {
                    throw new IllegalArgumentException("Ghi chú giải thích bắt buộc khi xác nhận đã giao đúng");
                }
                yield shippingIssueHandlerService.confirmDeliveredCorrectly(borrowId, notes);
            }
            case CANCEL -> shippingIssueHandlerService.cancelBorrowWithRestore(borrowId);
            case CANCEL_LOST -> shippingIssueHandlerService.cancelLostBorrow(borrowId);
            case REPLACE_REDELIVER -> shippingIssueHandlerService.replaceAndRedeliver(borrowId, replacementBookId);
            case AUTO_CANCEL -> shippingIssueHandlerService.autoCancel3Failures(borrowId);
        };
    }
}
