package com.library.shipping.domain.port;

import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ShippingOrderRepository {

    ShippingOrder save(ShippingOrder shippingOrder);

    Optional<ShippingOrder> findById(UUID id);

    List<ShippingOrder> findByBorrowRecordIdAndType(UUID borrowRecordId, ShippingType type);

    List<ShippingOrder> findByBorrowRecordIdInAndType(List<UUID> borrowRecordIds, ShippingType type);

    int countByBorrowRecordIdAndType(UUID borrowRecordId, ShippingType type);

    Optional<ShippingOrder> findActiveByBorrowRecordId(UUID borrowRecordId);

    void updateStatus(UUID id, ShippingOrderStatus status, Instant timestampField);

    List<ShippingOrder> findByStatusAndChangedSince(ShippingOrderStatus status, Instant since);

    List<ShippingOrder> findByStatus(ShippingOrderStatus status);
}
