package com.library.shipping.infrastructure.notification;

import com.library.shipping.domain.port.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.concurrent.CompletableFuture;
import java.util.UUID;

@Slf4j
@Service
public class NotificationServiceImpl implements NotificationService {

    @Async("shippingNotificationExecutor")
    @Override
    public CompletableFuture<Void> notifyReader(UUID readerId, String message) {
        try {
            log.info("[MOCK NOTIFICATION] To reader ({}): {}", readerId, message);
        } catch (Exception e) {
            log.error("Failed to notify reader {}: {}", readerId, e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }

    @Async("shippingNotificationExecutor")
    @Override
    public CompletableFuture<Void> notifyLibrarian(String message, UUID borrowRecordId) {
        try {
            log.info("[MOCK NOTIFICATION] To librarian: message='{}', borrowRecordId={}", message, borrowRecordId);
        } catch (Exception e) {
            log.error("Failed to notify librarian for borrowRecordId {}: {}", borrowRecordId, e.getMessage(), e);
        }
        return CompletableFuture.completedFuture(null);
    }
}
