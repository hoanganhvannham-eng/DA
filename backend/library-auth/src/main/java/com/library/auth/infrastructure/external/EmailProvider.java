package com.library.auth.infrastructure.external;

public interface EmailProvider {

    void sendVerificationEmail(String toEmail, String verifyLink);

    void sendResetPasswordEmail(String toEmail, String resetLink);
}
