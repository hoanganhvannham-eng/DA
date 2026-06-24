package com.library.shipping.application.service;

import com.library.shipping.domain.entity.ShippingStatusLog;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.port.ShippingStatusLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingStatusLogService {

    private final ShippingStatusLogRepository shippingStatusLogRepository;

    @Transactional
    public void logStatusChange(UUID shippingOrderId, ShippingOrderStatus fromStatus,
                                 ShippingOrderStatus toStatus, String changedBy) {
        ShippingStatusLog logEntry = new ShippingStatusLog();
        logEntry.setShippingOrderId(shippingOrderId);
        logEntry.setFromStatus(fromStatus);
        logEntry.setToStatus(toStatus);
        logEntry.setChangedBy(changedBy);
        logEntry.setChangedAt(Instant.now());

        shippingStatusLogRepository.save(logEntry);

        log.info("Shipping status log: orderId={}, from={}, to={}, changedBy={}",
                shippingOrderId, fromStatus, toStatus, changedBy);
    }
}
