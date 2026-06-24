package com.library.bookreturn.domain.port;

import java.util.UUID;

public interface NotificationService {

    void notifyLibrarian(String message, UUID borrowRecordId);

    void notifyReader(UUID readerId, String message);
}
