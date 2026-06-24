package com.library.wallet.application.job;

import com.library.wallet.application.service.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class PaymentExpiryJob {

    private final PaymentService paymentService;

    @Scheduled(fixedRate = 60_000)
    public void expirePendingPayments() {
        log.debug("Running payment expiry job...");
        paymentService.processExpiredPayments();
    }
}
