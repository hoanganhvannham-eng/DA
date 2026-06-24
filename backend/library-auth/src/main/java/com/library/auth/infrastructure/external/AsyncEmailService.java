package com.library.auth.infrastructure.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class AsyncEmailService {

    private final EmailProvider emailProvider;

    @Async("emailExecutor")
    public void sendVerificationEmailAsync(String toEmail, String verifyLink) {
        log.debug("Sending verification email async: to={}", toEmail);
        try {
            emailProvider.sendVerificationEmail(toEmail, verifyLink);
            log.info("Verification email sent successfully: to={}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send verification email to {}: {}", toEmail, e.getMessage(), e);
        }
    }

    @Async("emailExecutor")
    public void sendResetPasswordEmailAsync(String toEmail, String resetLink) {
        log.debug("Sending reset password email async: to={}", toEmail);
        try {
            emailProvider.sendResetPasswordEmail(toEmail, resetLink);
            log.info("Reset password email sent successfully: to={}", toEmail);
        } catch (Exception e) {
            log.error("Failed to send reset password email to {}: {}", toEmail, e.getMessage(), e);
        }
    }
}
