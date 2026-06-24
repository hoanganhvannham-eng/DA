package com.library.auth.presentation.dto.auth;

import com.library.auth.domain.enums.UserRole;
import com.library.auth.presentation.dto.common.UserInfo;

public record LoginResponse(
        String token,
        long expiresIn,
        UserInfo user
) {}
