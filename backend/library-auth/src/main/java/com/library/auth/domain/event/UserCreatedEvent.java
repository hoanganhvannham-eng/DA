package com.library.auth.domain.event;

import java.util.UUID;

public record UserCreatedEvent(
    UUID userId,
    String email
) {}
