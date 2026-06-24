package com.library.borrow.application.listener;

import com.library.borrow.application.service.BorrowService;
import com.library.wallet.domain.event.WalletTopUpEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class BorrowWalletEventListener {

    private final BorrowService borrowService;

    @Async
    @EventListener
    public void handleWalletTopUp(WalletTopUpEvent event) {
        log.info("Received WalletTopUpEvent for userId={}, amount={}", event.userId(), event.amount());
        try {
            borrowService.processApprovedWaitingPayment(event.userId());
            log.info("Processed approved waiting payments for userId={}", event.userId());
        } catch (Exception e) {
            log.error("Failed to process approved waiting payments for userId={}: {}",
                    event.userId(), e.getMessage());
        }
    }
}
