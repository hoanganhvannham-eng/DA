package com.library.auth.infrastructure.config;

import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "auth.email")
@Validated
public record AuthEmailProperties(

        @NotBlank(message = "auth.email.verify-url-template must not be blank")
        String verifyUrlTemplate,

        @NotBlank(message = "auth.email.reset-url-template must not be blank")
        String resetUrlTemplate
) {}
