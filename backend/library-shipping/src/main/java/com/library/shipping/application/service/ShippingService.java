package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.config.ShippingProperties;
import com.library.shipping.application.dto.CreateShipmentResult;
import com.library.shipping.application.dto.ShippingOrderDTO;
import com.library.shipping.application.mapper.ShippingMapper;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.domain.exception.InventoryConflictException;
import com.library.shipping.domain.exception.ProviderUnavailableException;
import com.library.shipping.domain.exception.ShippingAttemptLimitExceededException;
import com.library.shipping.domain.exception.ShippingFulfillmentMismatchException;
import com.library.shipping.domain.exception.ShippingInvalidStatusException;
import com.library.shipping.domain.port.MockShippingProvider;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.domain.port.ShippingOrderRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ShippingService {

    private final ShippingOrderRepository shippingOrderRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final MockShippingProvider mockShippingProvider;
    private final ShippingStatusLogService shippingStatusLogService;
    private final NotificationService notificationService;
    private final ShippingMapper shippingMapper;
    private final ShippingProperties shippingProperties;
    private final InventoryConflictHandler inventoryConflictHandler;

    @Transactional
    public CreateShipmentResult createShipment(UUID borrowId, UUID librarianId) {
        BorrowRecord borrow = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Create shipment failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        validateBorrowForShipment(borrow);

        UUID bookId = borrow.getBookId();
        int availableQty = bookRepository.getAvailableQuantityForUpdate(bookId);
        if (availableQty <= 0) {
            return inventoryConflictHandler.handle(borrow, librarianId);
        }

        MockShippingProvider.ShipmentResult providerResult;
        try {
            providerResult = mockShippingProvider.createShipment(
                    ShippingType.DELIVERY, borrow.getShippingAddress(), shippingProperties.getDefaultCarrier());
        } catch (Exception e) {
            log.error("Mock shipping provider call failed for borrowId={}", borrowId, e);
            throw new ProviderUnavailableException();
        }

        int attemptNumber = borrow.getDeliveryAttemptCount() != null
                ? borrow.getDeliveryAttemptCount() + 1 : 1;

        ShippingOrder shippingOrder = new ShippingOrder();
        shippingOrder.setBorrowRecordId(borrowId);
        shippingOrder.setType(ShippingType.DELIVERY);
        shippingOrder.setStatus(ShippingOrderStatus.CREATED);
        shippingOrder.setTrackingNumber(providerResult.trackingNumber());
        shippingOrder.setShippingAddress(borrow.getShippingAddress());
        shippingOrder.setCarrier(shippingProperties.getDefaultCarrier());
        shippingOrder.setAttemptNumber(attemptNumber);
        shippingOrder.setEstimatedDeliveryDate(providerResult.estimatedDeliveryDate());
        shippingOrder.setCreatedBy(librarianId);
        shippingOrder = shippingOrderRepository.save(shippingOrder);

        shippingStatusLogService.logStatusChange(
                shippingOrder.getId(), null, ShippingOrderStatus.CREATED, "LIBRARIAN");

        borrow.setStatus(BorrowStatus.IN_DELIVERY);
        borrow.setDeliveryAttemptCount(attemptNumber);
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(
                borrow.getReaderId(),
                "Sách đang được chuẩn bị giao. Mã tracking: " + providerResult.trackingNumber());

        log.info("Shipment created: borrowId={}, tracking={}, attempt={}, librarianId={}",
                borrowId, providerResult.trackingNumber(), attemptNumber, librarianId);

        ShippingOrderDTO shippingDTO = shippingMapper.toDTO(shippingOrder);
        CreateShipmentResult.BorrowStatusInfo borrowInfo = CreateShipmentResult.BorrowStatusInfo.builder()
                .id(borrow.getId())
                .status(BorrowStatus.IN_DELIVERY.name())
                .build();

        return CreateShipmentResult.builder()
                .message("Tạo đơn giao hàng thành công")
                .shippingOrder(shippingDTO)
                .borrow(borrowInfo)
                .build();
    }

    private void validateBorrowForShipment(BorrowRecord borrow) {
        if (borrow.getStatus() != BorrowStatus.AWAITING_SHIPMENT) {
            log.warn("Create shipment failed: borrow id={} status={} is not AWAITING_SHIPMENT",
                    borrow.getId(), borrow.getStatus());
            throw new ShippingInvalidStatusException();
        }

        if (borrow.getFulfillmentMethod() != FulfillmentMethod.DELIVERY) {
            log.warn("Create shipment failed: borrow id={} fulfillment={} is not DELIVERY",
                    borrow.getId(), borrow.getFulfillmentMethod());
            throw new ShippingFulfillmentMismatchException();
        }

        int currentAttempts = borrow.getDeliveryAttemptCount() != null
                ? borrow.getDeliveryAttemptCount() : 0;
        if (currentAttempts >= shippingProperties.getMaxDeliveryAttempts()) {
            log.warn("Create shipment failed: borrow id={} attempts={} >= {}",
                    borrow.getId(), currentAttempts, shippingProperties.getMaxDeliveryAttempts());
            throw new ShippingAttemptLimitExceededException();
        }
    }

    @Transactional(readOnly = true)
    public List<BorrowRecord> getAwaitingShipmentBorrows() {
        return borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.AWAITING_SHIPMENT);
    }
}
