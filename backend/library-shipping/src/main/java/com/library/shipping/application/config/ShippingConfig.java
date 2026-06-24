package com.library.shipping.application.config;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@EnableConfigurationProperties({ ShippingProperties.class, AutoConfirmProperties.class })
public class ShippingConfig {
}
