package com.library.shipping.domain.port;

import com.library.shipping.domain.enums.ShippingType;

import java.time.Instant;

public interface MockShippingProvider {

    ShipmentResult createShipment(ShippingType type, String shippingAddress, String carrier);

    record ShipmentResult(String trackingNumber, String status, Instant estimatedDeliveryDate) {}
}
