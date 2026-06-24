package com.library.shipping.application.job;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.service.CancelBorrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class AutoCancelPendingApprovalJob {

    private final BorrowRecordRepository borrowRecordRepository;
    private final CancelBorrowService cancelBorrowService;
    private final PlatformTransactionManager transactionManager;

    @Scheduled(cron = "${app.auto-cancel-pending.cron:0 */5 * * * *}")
    public void autoCancelExpiredPendingApprovals() {
        log.info("Auto-cancel pending approval job started");

        List<BorrowRecord> pendingApprovals = borrowRecordRepository
                .findByStatusOrderByCreatedAtAsc(BorrowStatus.PENDING_APPROVAL);

        if (pendingApprovals.isEmpty()) {
            log.debug("No PENDING_APPROVAL borrows to process");
            return;
        }

        Instant now = Instant.now();
        int cancelled = 0;

        for (BorrowRecord borrow : pendingApprovals) {
            if (borrow.getPendingApprovalUntil() != null && now.isAfter(borrow.getPendingApprovalUntil())) {
                TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
                txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
                txTemplate.execute(status -> {
                    try {
                        cancelBorrowService.cancelBorrow(borrow.getId(), null, true);
                        log.info("Auto-cancelled expired pending approval: borrowId={}, pendingApprovalUntil={}",
                                borrow.getId(), borrow.getPendingApprovalUntil());
                    } catch (Exception e) {
                        log.error("Failed to auto-cancel borrow {}: {}", borrow.getId(), e.getMessage());
                    }
                    return null;
                });
                cancelled++;
            }
        }

        log.info("Auto-cancel pending approval job completed: processed={}, cancelled={}",
                pendingApprovals.size(), cancelled);
    }
}
