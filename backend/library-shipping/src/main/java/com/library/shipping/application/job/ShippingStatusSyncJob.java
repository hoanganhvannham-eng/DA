package com.library.shipping.application.job;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.config.ShippingProperties;
import com.library.shipping.application.service.ShippingStatusLogService;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.domain.port.ShippingOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.TransactionDefinition;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;
import java.util.stream.Collectors;

@Slf4j
@Component
@RequiredArgsConstructor
public class ShippingStatusSyncJob {

    private final ShippingOrderRepository shippingOrderRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final ShippingStatusLogService shippingStatusLogService;
    private final NotificationService notificationService;
    private final ShippingProperties shippingProperties;
    private final PlatformTransactionManager transactionManager;

    @Scheduled(fixedDelayString = "${shipping.sync.interval:30000}")
    public void syncShippingStatuses() {
        log.debug("Shipping status sync job started");

        Map<UUID, BorrowRecord> borrowCache = new HashMap<>();

        processTransitions(ShippingOrderStatus.CREATED, ShippingOrderStatus.PICKED_UP,
                shippingProperties.getSync().getCreatedToPickedUpDelayMinutes(), borrowCache);
        processTransitions(ShippingOrderStatus.PICKED_UP, ShippingOrderStatus.IN_TRANSIT,
                shippingProperties.getSync().getPickedUpToInTransitDelayMinutes(), borrowCache);
        processTransitionsFromInTransit(borrowCache);

        log.debug("Shipping status sync job completed");
    }

    private void processTransitions(ShippingOrderStatus fromStatus, ShippingOrderStatus toStatus, long delayMinutes,
                                      Map<UUID, BorrowRecord> borrowCache) {
        List<ShippingOrder> orders = shippingOrderRepository.findByStatus(fromStatus);
        Instant cutoff = Instant.now().minus(delayMinutes, ChronoUnit.MINUTES);

        batchLoadBorrowRecords(orders, borrowCache);

        for (ShippingOrder order : orders) {
            if (order.getCreatedAt().isBefore(cutoff)) {
                transitionOrder(order, fromStatus, toStatus, borrowCache);
            }
        }
    }

    private void processTransitionsFromInTransit(Map<UUID, BorrowRecord> borrowCache) {
        List<ShippingOrder> orders = shippingOrderRepository.findByStatus(ShippingOrderStatus.IN_TRANSIT);
        Instant cutoff = Instant.now().minus(
                shippingProperties.getSync().getInTransitToDeliveryDelayMinutes(), ChronoUnit.MINUTES);

        batchLoadBorrowRecords(orders, borrowCache);

        for (ShippingOrder order : orders) {
            if (order.getInTransitAt() != null && order.getInTransitAt().isBefore(cutoff)) {
                int roll = ThreadLocalRandom.current().nextInt(100);
                ShippingOrderStatus toStatus;
                if (roll < shippingProperties.getSimulation().getDeliveredProbability()) {
                    toStatus = ShippingOrderStatus.DELIVERED;
                } else if (roll < shippingProperties.getSimulation().getDeliveredProbability()
                        + shippingProperties.getSimulation().getFailedProbability()) {
                    toStatus = ShippingOrderStatus.FAILED;
                } else {
                    toStatus = ShippingOrderStatus.LOST;
                }
                transitionOrder(order, ShippingOrderStatus.IN_TRANSIT, toStatus, borrowCache);
            }
        }
    }

    private void batchLoadBorrowRecords(List<ShippingOrder> orders, Map<UUID, BorrowRecord> borrowCache) {
        List<UUID> missingIds = orders.stream()
                .map(ShippingOrder::getBorrowRecordId)
                .filter(id -> !borrowCache.containsKey(id))
                .distinct()
                .collect(Collectors.toList());

        if (!missingIds.isEmpty()) {
            borrowRecordRepository.findAllById(missingIds)
                    .forEach(borrow -> borrowCache.put(borrow.getId(), borrow));
        }
    }

    private void transitionOrder(ShippingOrder order, ShippingOrderStatus fromStatus, ShippingOrderStatus toStatus,
                                  Map<UUID, BorrowRecord> borrowCache) {
        TransactionTemplate txTemplate = new TransactionTemplate(transactionManager);
        txTemplate.setPropagationBehavior(TransactionDefinition.PROPAGATION_REQUIRES_NEW);
        txTemplate.execute(status -> {
            try {
                Instant now = Instant.now();

                switch (toStatus) {
                    case PICKED_UP -> order.setPickedUpAt(now);
                    case IN_TRANSIT -> order.setInTransitAt(now);
                    case DELIVERED -> order.setDeliveredAt(now);
                    case FAILED -> order.setFailedAt(now);
                    case LOST -> order.setFailedAt(now);
                }
                order.setStatus(toStatus);
                shippingOrderRepository.save(order);

                shippingStatusLogService.logStatusChange(order.getId(), fromStatus, toStatus, "SYSTEM");

                BorrowStatus borrowStatus = mapToBorrowStatus(toStatus, order.getType());
                if (borrowStatus != null) {
                    BorrowRecord borrow = borrowCache.get(order.getBorrowRecordId());
                    if (borrow != null) {
                        borrow.setStatus(borrowStatus);
                        borrowRecordRepository.save(borrow);

                        if (order.getType() == ShippingType.DELIVERY) {
                            switch (toStatus) {
                                case DELIVERED -> notificationService.notifyReader(
                                        borrow.getReaderId(),
                                        "Sách đã được giao. Vui lòng xác nhận nhận sách.");
                                case FAILED -> {
                                    String failMsg = "Giao sách thất bại. Lý do: Lỗi vận chuyển";
                                    notificationService.notifyLibrarian(failMsg, borrow.getId());
                                    notificationService.notifyReader(borrow.getReaderId(),
                                            "Giao sách thất bại. Nhân viên thư viện sẽ liên hệ với bạn.");
                                }
                                case LOST -> notificationService.notifyLibrarian(
                                        "Package bị mất (shippingOrderId: " + order.getId() + "). Cần xử lý.",
                                        borrow.getId());
                            }
                        } else if (order.getType() == ShippingType.RETURN) {
                            switch (toStatus) {
                                case DELIVERED -> notificationService.notifyLibrarian(
                                        "Sách trả đã được giao đến thư viện (shippingOrderId: " + order.getId() + ").",
                                        borrow.getId());
                                case FAILED -> {
                                    String failMsg = "Trả sách thất bại (shippingOrderId: " + order.getId() + ").";
                                    notificationService.notifyLibrarian(failMsg, borrow.getId());
                                    notificationService.notifyReader(borrow.getReaderId(),
                                            "Trả sách thất bại. Nhân viên thư viện sẽ liên hệ với bạn.");
                                }
                                case LOST -> notificationService.notifyLibrarian(
                                        "Sách trả bị mất (shippingOrderId: " + order.getId() + "). Cần xử lý.",
                                        borrow.getId());
                            }
                        }
                    }
                }

                log.info("Shipping transition: orderId={}, {} -> {} at {}",
                        order.getId(), fromStatus, toStatus, now);
            } catch (Exception e) {
                log.error("Failed to process shipping transition for orderId={}: {} -> {}: {}",
                        order.getId(), fromStatus, toStatus, e.getMessage(), e);
                throw e;
            }
            return null;
        });
    }

    private BorrowStatus mapToBorrowStatus(ShippingOrderStatus shippingStatus, ShippingType shippingType) {
        return switch (shippingStatus) {
            case DELIVERED -> shippingType == ShippingType.RETURN
                    ? BorrowStatus.RETURN_RECEIVED : BorrowStatus.DELIVERED_PENDING;
            case FAILED -> shippingType == ShippingType.RETURN
                    ? BorrowStatus.RETURN_SHIPPING_FAILED : BorrowStatus.DELIVERY_FAILED;
            case LOST -> shippingType == ShippingType.RETURN
                    ? BorrowStatus.RETURN_SHIPPING_LOST : BorrowStatus.DELIVERY_LOST;
            default -> null;
        };
    }
}
