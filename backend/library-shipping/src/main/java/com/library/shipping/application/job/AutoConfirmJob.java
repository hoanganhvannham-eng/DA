package com.library.shipping.application.job;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.application.config.AutoConfirmProperties;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.domain.port.ShippingOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoConfirmJob {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final ShippingOrderRepository shippingOrderRepository;
    private final NotificationService notificationService;
    private final AutoConfirmProperties autoConfirmProperties;
    private final PlatformTransactionManager transactionManager;

    @Scheduled(cron = "${app.auto-confirm.cron}")
    public void autoConfirmDeliveries() {
        log.info("Auto-confirm delivery job started");

        List<BorrowRecord> pendingBorrows = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(
                BorrowStatus.DELIVERED_PENDING);

        if (pendingBorrows.isEmpty()) {
            log.debug("No DELIVERED_PENDING borrows to process");
            return;
        }

        List<UUID> borrowIds = pendingBorrows.stream()
                .map(BorrowRecord::getId)
                .toList();
        List<ShippingOrder> deliveredOrders = shippingOrderRepository
                .findByBorrowRecordIdInAndType(borrowIds, ShippingType.DELIVERY);
        Map<UUID, Instant> deliveredAtMap = deliveredOrders.stream()
                .filter(o -> o.getStatus() == ShippingOrderStatus.DELIVERED)
                .collect(Collectors.toMap(
                        ShippingOrder::getBorrowRecordId,
                        o -> o.getDeliveredAt() != null ? o.getDeliveredAt() : o.getUpdatedAt(),
                        (a, b) -> a));

        for (BorrowRecord borrow : pendingBorrows) {
            Instant deliveredAt = deliveredAtMap.get(borrow.getId());
            if (deliveredAt == null) {
                log.warn("No delivered shipping found for borrow id={}, skipping", borrow.getId());
                continue;
            }

            long daysSinceDelivered = ChronoUnit.DAYS.between(deliveredAt, Instant.now());

            if (daysSinceDelivered == autoConfirmProperties.getReminder1Days()) {
                notificationService.notifyReader(
                        borrow.getReaderId(),
                        "Nhắc nhở: Vui lòng xác nhận nhận sách");
                log.info("Reminder 1 sent for borrowId={}", borrow.getId());
            } else if (daysSinceDelivered == autoConfirmProperties.getReminder2Days()) {
                notificationService.notifyReader(
                        borrow.getReaderId(),
                        "Lần nhắc cuối: Sách sẽ được tự động xác nhận vào ngày mai");
                log.info("Reminder 2 sent for borrowId={}", borrow.getId());
            } else if (daysSinceDelivered >= autoConfirmProperties.getAutoConfirmDays()) {
                autoConfirm(borrow);
            }
        }

        log.info("Auto-confirm delivery job completed");
    }

    private void autoConfirm(BorrowRecord borrow) {
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        txTemplate.execute(status -> {
            Instant now = Instant.now();
            borrow.setStatus(BorrowStatus.BORROWING);
            borrow.setActualBorrowDate(now);
            borrow.setDueDate(now.plus(borrow.getDurationDays(), ChronoUnit.DAYS));
            borrow.setAutoConfirmed(true);

            bookRepository.incrementBorrowedQuantity(borrow.getBookId());
            borrowRecordRepository.save(borrow);

            notificationService.notifyReader(
                    borrow.getReaderId(),
                    "Sách đã được tự động xác nhận nhận");

            log.info("Auto-confirmed: borrowId={}, dueDate={}", borrow.getId(), borrow.getDueDate());
            return null;
        });
    }
}
