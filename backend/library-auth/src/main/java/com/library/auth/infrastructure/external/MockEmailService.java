package com.library.auth.infrastructure.external;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("local | test")
public class MockEmailService implements EmailProvider {

    @Override
    public void sendVerificationEmail(String toEmail, String verifyLink) {
        log.info("========================================");
        log.info("[MOCK EMAIL] Verification Email");
        log.info("To: {}", toEmail);
        log.info("Subject: Xác nhận tài khoản Library Management");
        log.info("Body: Vui lòng click link sau để xác nhận tài khoản:");
        log.info("Verify Link: {}", verifyLink);
        log.info("(Link có hiệu lực trong 24 giờ)");
        log.info("========================================");
    }

    @Override
    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        log.info("========================================");
        log.info("[MOCK EMAIL] Reset Password Email");
        log.info("To: {}", toEmail);
        log.info("Subject: Đặt lại mật khẩu Library Management");
        log.info("Body: Bạn đã yêu cầu đặt lại mật khẩu. Click link sau:");
        log.info("Reset Link: {}", resetLink);
        log.info("(Link có hiệu lực trong 1 giờ)");
        log.info("========================================");
    }
}
