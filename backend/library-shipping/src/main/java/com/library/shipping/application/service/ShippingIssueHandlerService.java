package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.exception.InvalidStatusTransitionException;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.config.ShippingProperties;
import com.library.shipping.application.dto.HandleIssueResult;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.exception.InventoryConflictException;
import com.library.shipping.domain.exception.ShippingAttemptLimitExceededException;
import com.library.shipping.domain.exception.ShippingInvalidStatusException;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.domain.port.ShippingOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingIssueHandlerService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final ShippingOrderRepository shippingOrderRepository;
    private final ShippingStatusLogService shippingStatusLogService;
    private final NotificationService notificationService;
    private final ShippingProperties shippingProperties;

    @Transactional
    public HandleIssueResult scheduleRedelivery(UUID borrowId) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);
        validateIssueStatus(borrow);

        if (borrow.getStatus() == BorrowStatus.DELIVERY_LOST) {
            log.warn("Redeliver not allowed for DELIVERY_LOST borrowId={}", borrowId);
            throw new ShippingInvalidStatusException();
        }

        int currentAttempts = borrow.getDeliveryAttemptCount() != null ? borrow.getDeliveryAttemptCount() : 0;
        if (currentAttempts >= shippingProperties.getMaxDeliveryAttempts()) {
            log.warn("Redeliver failed: borrowId={} attempts={} >= {}", borrowId, currentAttempts, shippingProperties.getMaxDeliveryAttempts());
            throw new ShippingAttemptLimitExceededException();
        }

        int newAttempt = currentAttempts + 1;
        borrow.setStatus(BorrowStatus.AWAITING_SHIPMENT);
        borrow.setDeliveryAttemptCount(newAttempt);
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Sách sẽ được giao lại (lần " + newAttempt + "). Vui lòng chờ thông báo.");

        log.info("Redeliver scheduled: borrowId={}, attempt={}", borrowId, newAttempt);

        return HandleIssueResult.builder()
                .message("Đã chuyển sang chờ giao lại")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    @Transactional
    public HandleIssueResult confirmDeliveredCorrectly(UUID borrowId, String librarianNote) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);

        if (borrow.getStatus() == BorrowStatus.DELIVERY_LOST) {
            log.warn("Confirm delivered not allowed for DELIVERY_LOST borrowId={}", borrowId);
            throw new ShippingInvalidStatusException();
        }

        if (borrow.getStatus() != BorrowStatus.DELIVERY_ISSUE
                && borrow.getStatus() != BorrowStatus.DELIVERY_FAILED) {
            log.warn("Confirm delivered failed: borrowId={} status={} not valid",
                    borrowId, borrow.getStatus());
            throw new InvalidStatusTransitionException();
        }

        String sanitizedNote = librarianNote != null ? HtmlUtils.htmlEscape(librarianNote) : null;

        Instant now = Instant.now();
        borrow.setStatus(BorrowStatus.BORROWING);
        borrow.setActualBorrowDate(now);
        borrow.setDueDate(now.plus(borrow.getDurationDays(), ChronoUnit.DAYS));
        borrow.setLibrarianNote(sanitizedNote);

        bookRepository.incrementBorrowedQuantity(borrow.getBookId());
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Sách đã được xác nhận giao thành công.");

        log.info("Delivered confirmed correctly: borrowId={}, librarianNote={}", borrowId, sanitizedNote);

        return HandleIssueResult.builder()
                .message("Xác nhận giao thành công")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    @Transactional
    public HandleIssueResult cancelBorrowWithRestore(UUID borrowId) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);

        if (borrow.getStatus() != BorrowStatus.DELIVERY_ISSUE
                && borrow.getStatus() != BorrowStatus.DELIVERY_FAILED) {
            log.warn("Cancel failed: borrowId={} status={} must be ISSUE/FAILED",
                    borrowId, borrow.getStatus());
            throw new InvalidStatusTransitionException();
        }

        cancelActiveShipping(borrowId);

        borrow.setStatus(BorrowStatus.CANCELLED);
        bookRepository.incrementStock(borrow.getBookId());
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Đơn mượn đã bị hủy.");

        log.info("Borrow cancelled with restore: borrowId={}", borrowId);

        return HandleIssueResult.builder()
                .message("Hủy đơn thành công")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    @Transactional
    public HandleIssueResult autoCancel3Failures(UUID borrowId) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);

        cancelActiveShipping(borrowId);

        borrow.setStatus(BorrowStatus.CANCELLED);
        bookRepository.incrementStock(borrow.getBookId());
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Đơn mượn tự động hủy sau " + shippingProperties.getMaxDeliveryAttempts() + " lần giao thất bại.");

        log.info("Auto-cancel after {} failures: borrowId={}", shippingProperties.getMaxDeliveryAttempts(), borrowId);

        return HandleIssueResult.builder()
                .message("Đã tự động hủy đơn sau " + shippingProperties.getMaxDeliveryAttempts() + " lần thất bại")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    @Transactional
    public HandleIssueResult cancelLostBorrow(UUID borrowId) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);

        if (borrow.getStatus() != BorrowStatus.DELIVERY_LOST) {
            log.warn("Cancel lost failed: borrowId={} status={} is not DELIVERY_LOST",
                    borrowId, borrow.getStatus());
            throw new InvalidStatusTransitionException();
        }

        cancelActiveShipping(borrowId);

        borrow.setStatus(BorrowStatus.CANCELLED);
        bookRepository.incrementLostCount(borrow.getBookId());
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Đơn mượn đã hủy do mất hàng. Không phạt độc giả.");

        log.info("Cancel lost borrow: borrowId={}, lostCount incremented", borrowId);

        return HandleIssueResult.builder()
                .message("Đã hủy đơn + ghi nhận mất sách")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    @Transactional
    public HandleIssueResult replaceAndRedeliver(UUID borrowId, UUID replacementBookId) {
        BorrowRecord borrow = findBorrowOrThrow(borrowId);

        if (borrow.getStatus() != BorrowStatus.DELIVERY_LOST) {
            log.warn("Replace+redeliver failed: borrowId={} status={} is not DELIVERY_LOST",
                    borrowId, borrow.getStatus());
            throw new InvalidStatusTransitionException();
        }

        if (replacementBookId == null) {
            log.warn("Replace+redeliver failed: replacementBookId is null for borrowId={}", borrowId);
            throw new IllegalArgumentException("Cần chọn sách thay thế");
        }

        int availableQty = bookRepository.getAvailableQuantityForUpdate(replacementBookId);
        if (availableQty <= 0) {
            log.warn("Replace+redeliver failed: replacement bookId={} not available", replacementBookId);
            throw new InventoryConflictException();
        }

        int currentAttempts = borrow.getDeliveryAttemptCount() != null ? borrow.getDeliveryAttemptCount() : 0;
        int newAttempt = currentAttempts + 1;

        bookRepository.incrementLostCount(borrow.getBookId());

        bookRepository.decrementAvailableQuantity(replacementBookId);

        borrow.setStatus(BorrowStatus.AWAITING_SHIPMENT);
        borrow.setReplacementBookId(replacementBookId);
        borrow.setDeliveryAttemptCount(newAttempt);
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Sách sẽ được giao lại với bản sách khác.");

        log.info("Replace and redeliver: borrowId={}, oldBookId={}, replacementBookId={}, attempt={}",
                borrowId, borrow.getBookId(), replacementBookId, newAttempt);

        return HandleIssueResult.builder()
                .message("Đã cấp lại sách và chuyển sang chờ giao")
                .borrow(buildBorrowInfo(borrow))
                .build();
    }

    private void validateIssueStatus(BorrowRecord borrow) {
        BorrowStatus status = borrow.getStatus();
        if (status != BorrowStatus.DELIVERY_ISSUE
                && status != BorrowStatus.DELIVERY_FAILED
                && status != BorrowStatus.DELIVERY_LOST) {
            log.warn("Invalid issue status: borrowId={}, status={}", borrow.getId(), status);
            throw new ShippingInvalidStatusException();
        }
    }

    private void cancelActiveShipping(UUID borrowId) {
        Optional<ShippingOrder> activeShipping = shippingOrderRepository.findActiveByBorrowRecordId(borrowId);
        activeShipping.ifPresent(shipping -> {
            if (shipping.getStatus() == ShippingOrderStatus.CREATED) {
                shippingOrderRepository.updateStatus(
                        shipping.getId(), ShippingOrderStatus.CANCELLED, Instant.now());
                shippingStatusLogService.logStatusChange(
                        shipping.getId(), ShippingOrderStatus.CREATED,
                        ShippingOrderStatus.CANCELLED, "SYSTEM");
                log.info("Shipping cancelled: shippingId={}, borrowId={}", shipping.getId(), borrowId);
            }
        });
    }

    private BorrowRecord findBorrowOrThrow(UUID borrowId) {
        return borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });
    }

    private HandleIssueResult.BorrowStatusInfo buildBorrowInfo(BorrowRecord borrow) {
        HandleIssueResult.BorrowStatusInfo.BorrowStatusInfoBuilder builder = HandleIssueResult.BorrowStatusInfo.builder()
                .id(borrow.getId())
                .status(borrow.getStatus().name())
                .deliveryAttempts(borrow.getDeliveryAttemptCount());
        if (borrow.getDueDate() != null) {
            builder.dueDate(borrow.getDueDate().toString());
        }
        return builder.build();
    }
}
