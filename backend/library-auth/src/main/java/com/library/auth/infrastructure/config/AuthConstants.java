package com.library.auth.infrastructure.config;

public final class AuthConstants {

    private AuthConstants() {
    }

    public static final int EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS = 24;

    public static final String VERIFY_EMAIL_URL_TEMPLATE = "http://localhost:5173/verify-email?token=%s";

    public static final int MAX_FAILED_ATTEMPTS = 5;

    public static final int LOCKOUT_DURATION_MINUTES = 15;

    public static final int RESET_PASSWORD_TOKEN_EXPIRY_HOURS = 1;

    public static final int MAX_RESET_PASSWORD_REQUESTS_PER_HOUR = 3;

    public static final long JWT_EXPIRATION_SECONDS = 86_400L;
}
