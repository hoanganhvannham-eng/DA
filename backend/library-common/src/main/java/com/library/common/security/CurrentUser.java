package com.library.common.security;

import java.util.Set;
import java.util.UUID;

public record CurrentUser(UUID id, String username, Set<String> roles) {}
