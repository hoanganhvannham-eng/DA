package com.library.shipping.application.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "shipping")
public class ShippingProperties {

    private Sync sync = new Sync();
    private Simulation simulation = new Simulation();

    @Positive
    private int maxDeliveryAttempts = 3;

    @Positive
    private int maxReturnAttempts = 3;

    @NotBlank
    private String defaultCarrier = "MOCK_CARRIER";

    @Getter
    @Setter
    public static class Sync {

        @Positive
        private long interval = 30000;

        @Min(0)
        private long createdToPickedUpDelayMinutes = 1;

        @Min(0)
        private long pickedUpToInTransitDelayMinutes = 2;

        @Min(0)
        private long inTransitToDeliveryDelayMinutes = 5;
    }

    @Getter
    @Setter
    public static class Simulation {

        @Min(0) @Max(100)
        private int deliveredProbability = 88;

        @Min(0) @Max(100)
        private int failedProbability = 10;

        @Min(0) @Max(100)
        private int lostProbability = 2;
    }
}
