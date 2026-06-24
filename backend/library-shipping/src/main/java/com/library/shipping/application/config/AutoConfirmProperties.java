package com.library.shipping.application.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import jakarta.validation.constraints.Positive;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app.auto-confirm")
public class AutoConfirmProperties {

    private String cron = "0 0 0 * * *";

    @Positive
    private int reminder1Days = 2;

    @Positive
    private int reminder2Days = 4;

    @Positive
    private int autoConfirmDays = 5;
}
