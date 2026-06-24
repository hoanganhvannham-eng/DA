package com.library.auth.infrastructure.config;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@ConfigurationProperties(prefix = "auth.jwt")
@Validated
public record AuthJwtProperties(

        @NotBlank(message = "auth.jwt.secret must not be blank")
        String secret,

        @Min(value = 60, message = "auth.jwt.expiration-seconds must be at least 60")
        long expirationSeconds,

        @NotBlank(message = "auth.jwt.issuer must not be blank")
        String issuer

) {}
