package com.library.wallet.application.listener;

import com.library.auth.domain.event.UserCreatedEvent;
import com.library.wallet.application.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class WalletEventListener {

    private final WalletService walletService;

    @Async
    @EventListener
    public void handleUserCreated(UserCreatedEvent event) {
        log.info("Received UserCreatedEvent for userId={}", event.userId());
        walletService.createWalletForUser(event.userId());
        log.info("Wallet created for userId={}", event.userId());
    }
}
