package com.library.shipping.application.mapper;

import com.library.shipping.application.dto.ShippingOrderDTO;
import com.library.shipping.domain.entity.ShippingOrder;
import org.springframework.stereotype.Component;

@Component
public class ShippingMapper {

    public ShippingOrderDTO toDTO(ShippingOrder entity) {
        if (entity == null) return null;

        return ShippingOrderDTO.builder()
                .id(entity.getId())
                .trackingNumber(entity.getTrackingNumber())
                .type(entity.getType().name())
                .status(entity.getStatus().name())
                .shippingAddress(entity.getShippingAddress())
                .attemptNumber(entity.getAttemptNumber())
                .estimatedDeliveryDate(entity.getEstimatedDeliveryDate())
                .createdAt(entity.getCreatedAt())
                .build();
    }
}
