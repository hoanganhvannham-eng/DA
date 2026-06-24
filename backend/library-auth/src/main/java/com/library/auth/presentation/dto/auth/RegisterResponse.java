package com.library.auth.presentation.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter @AllArgsConstructor
public class RegisterResponse {
    private final String message;
    private final String userId;
}
