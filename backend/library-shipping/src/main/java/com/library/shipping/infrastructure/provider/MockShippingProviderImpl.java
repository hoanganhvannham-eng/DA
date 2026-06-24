package com.library.shipping.infrastructure.provider;

import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.domain.port.MockShippingProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.Instant;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.concurrent.ThreadLocalRandom;

@Slf4j
@Component
public class MockShippingProviderImpl implements MockShippingProvider {

    @Override
    public ShipmentResult createShipment(ShippingType type, String shippingAddress, String carrier) {
        String trackingNumber = generateTrackingNumber();
        Instant estimatedDelivery = Instant.now().plus(3, ChronoUnit.DAYS);

        log.info("[MOCK SHIPPING PROVIDER] Shipment created: type={}, tracking={}, address={}, carrier={}",
                type, trackingNumber, shippingAddress, carrier);

        return new ShipmentResult(trackingNumber, "CREATED", estimatedDelivery);
    }

    private String generateTrackingNumber() {
        String datePart = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        int randomPart = ThreadLocalRandom.current().nextInt(1000, 10000);
        return "TRK-" + datePart + "-" + randomPart;
    }
}
