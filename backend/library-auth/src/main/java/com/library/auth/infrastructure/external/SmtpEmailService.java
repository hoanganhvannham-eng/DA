package com.library.auth.infrastructure.external;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@Profile("dev | prod")
@RequiredArgsConstructor
public class SmtpEmailService implements EmailProvider {

    private final JavaMailSender mailSender;

    @Override
    public void sendVerificationEmail(String toEmail, String verifyLink) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("Xác nhận tài khoản Library Management");
        msg.setText("""
            Vui lòng click link sau để xác nhận tài khoản:
            %s

            (Link có hiệu lực trong 24 giờ)
            """.formatted(verifyLink));
        mailSender.send(msg);
        log.info("Verification email sent to: {}", toEmail);
    }

    @Override
    public void sendResetPasswordEmail(String toEmail, String resetLink) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(toEmail);
        msg.setSubject("Đặt lại mật khẩu Library Management");
        msg.setText("""
            Bạn đã yêu cầu đặt lại mật khẩu. Click link sau:
            %s

            (Link có hiệu lực trong 1 giờ)
            """.formatted(resetLink));
        mailSender.send(msg);
        log.info("Reset password email sent to: {}", toEmail);
    }
}
