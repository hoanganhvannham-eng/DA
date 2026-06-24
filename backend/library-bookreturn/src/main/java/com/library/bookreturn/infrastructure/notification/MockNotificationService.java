package com.library.bookreturn.infrastructure.notification;

import com.library.bookreturn.domain.port.BookReturnNotification;
import com.library.bookreturn.domain.port.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Slf4j
@Service
@BookReturnNotification
public class MockNotificationService implements NotificationService {

    @Override
    public void notifyLibrarian(String message, UUID borrowRecordId) {
        log.info("[MOCK NOTIFICATION] Notifying librarian: message='{}', borrowRecordId={}", message, borrowRecordId);
    }

    @Override
    public void notifyReader(UUID readerId, String message) {
        log.info("[MOCK NOTIFICATION] Notifying reader ({}): {}", readerId, message);
    }
}
