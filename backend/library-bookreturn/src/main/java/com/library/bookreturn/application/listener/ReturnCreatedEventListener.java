package com.library.bookreturn.application.listener;

import com.library.bookreturn.domain.enums.ReturnMethod;
import com.library.bookreturn.domain.event.ReturnCreatedEvent;
import com.library.bookreturn.domain.port.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Slf4j
@Component
@RequiredArgsConstructor
public class ReturnCreatedEventListener {

    private final NotificationService notificationService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT)
    public void handle(ReturnCreatedEvent event) {
        String msg = event.returnMethod() == ReturnMethod.SHIPPING
                ? "Độc giả yêu cầu trả sách qua shipping"
                : "Độc giả yêu cầu trả sách tại thư viện";
        notificationService.notifyLibrarian(msg, event.borrowRecordId());
    }
}
