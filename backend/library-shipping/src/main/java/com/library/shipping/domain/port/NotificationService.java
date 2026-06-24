package com.library.shipping.domain.port;

import java.util.concurrent.CompletableFuture;
import java.util.UUID;

public interface NotificationService {

    CompletableFuture<Void> notifyReader(UUID readerId, String message);

    CompletableFuture<Void> notifyLibrarian(String message, UUID borrowRecordId);
}
