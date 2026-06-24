package com.library.auth.application.service;

import com.library.auth.domain.entity.AuthSession;
import com.library.auth.domain.entity.EmailVerificationToken;
import com.library.auth.domain.entity.LoginAttemptTracker;
import com.library.auth.domain.entity.ResetPasswordToken;
import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.TokenStatus;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.enums.UserStatus;
import com.library.auth.domain.exception.account.AccountLockedException;
import com.library.auth.domain.exception.account.DuplicateEmailException;
import com.library.auth.domain.exception.account.InvalidEmailDomainException;
import com.library.auth.domain.exception.account.InvalidAccountStateException;
import com.library.auth.domain.exception.account.UserNotFoundException;
import com.library.auth.domain.exception.credential.InvalidCredentialsException;
import com.library.auth.domain.exception.credential.SamePasswordException;
import com.library.auth.domain.exception.token.SessionNotFoundException;
import com.library.auth.domain.exception.token.SessionRevokedException;
import com.library.auth.domain.exception.token.TokenAlreadyUsedException;
import com.library.auth.domain.exception.token.TokenExpiredException;
import com.library.auth.domain.exception.token.TokenNotFoundException;
import com.library.auth.domain.service.AccountValidationService;
import com.library.auth.infrastructure.config.AuthConstants;
import com.library.auth.infrastructure.config.AuthEmailProperties;
import com.library.auth.infrastructure.config.AuthJwtProperties;
import com.library.auth.infrastructure.external.AsyncEmailService;
import com.library.auth.infrastructure.persistence.EmailVerificationTokenStore;
import com.library.auth.infrastructure.persistence.LoginAttemptTrackerStore;
import com.library.auth.infrastructure.persistence.ResetPasswordTokenStore;
import com.library.auth.infrastructure.persistence.SessionStore;
import com.library.auth.infrastructure.persistence.UserRepository;
import com.library.auth.infrastructure.security.JwtTokenProvider;
import com.library.auth.infrastructure.security.TokenHashUtil;
import com.library.auth.presentation.dto.auth.LoginRequest;
import com.library.auth.presentation.dto.auth.LoginResponse;
import com.library.auth.presentation.dto.auth.RegisterRequest;
import com.library.auth.presentation.dto.auth.RegisterResponse;
import com.library.auth.presentation.dto.common.MessageResponse;
import com.library.auth.presentation.dto.common.UserInfo;
import com.library.auth.domain.event.UserCreatedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final AuthEmailProperties authEmailProperties;
    private final AuthJwtProperties authJwtProperties;

    private final UserRepository userRepository;
    private final EmailVerificationTokenStore emailVerificationTokenStore;
    private final ResetPasswordTokenStore resetPasswordTokenStore;
    private final LoginAttemptTrackerStore loginAttemptTrackerStore;
    private final SessionStore sessionStore;
    private final PasswordEncoder passwordEncoder;
    private final AsyncEmailService asyncEmailService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ApplicationEventPublisher eventPublisher;
    private final AccountValidationService accountValidationService;

    // ─────────────────────────────────────────────────────────────────────────
    // UC01: Registration
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        validateEmailDomain(request.getEmail());

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateEmailException();
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = new User();
        user.setEmail(request.getEmail());
        user.setName(request.getName());
        user.setPasswordHash(passwordHash);
        user.setStatus(UserStatus.PENDING);
        user.setRole(UserRole.READER);
        user = userRepository.save(user);

        String rawToken = TokenHashUtil.generateToken();
        byte[] tokenHash = TokenHashUtil.sha256(rawToken);

        EmailVerificationToken token = new EmailVerificationToken();
        token.setUserId(user.getId());
        token.setTokenHash(tokenHash);
        token.setStatus(TokenStatus.ACTIVE);
        token.setExpiresAt(Instant.now().plus(
                AuthConstants.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS, ChronoUnit.HOURS));
        emailVerificationTokenStore.save(token);

        String verifyLink = String.format(authEmailProperties.verifyUrlTemplate(), rawToken);
        asyncEmailService.sendVerificationEmailAsync(request.getEmail(), verifyLink);

        eventPublisher.publishEvent(new UserCreatedEvent(user.getId(), user.getEmail()));

        log.info("User registered successfully: email={}, userId={}", request.getEmail(), user.getId());

        return new RegisterResponse(
                "Đăng ký thành công. Vui lòng kiểm tra email để xác nhận tài khoản",
                user.getId().toString()
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC01: Email Verification
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse verifyEmail(String rawToken) {
        byte[] tokenHash = TokenHashUtil.sha256(rawToken);

        EmailVerificationToken token = emailVerificationTokenStore.findByTokenHash(tokenHash)
                .orElseThrow(TokenNotFoundException::new);

        if (token.getStatus() == TokenStatus.USED || token.getStatus() == TokenStatus.INVALIDATED) {
            throw new TokenAlreadyUsedException();
        }

        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException(
                    "Link xác nhận đã hết hạn. Vui lòng yêu cầu gửi lại email xác nhận");
        }

        User user = userRepository.findById(token.getUserId())
                .orElseThrow(TokenNotFoundException::new);

        if (user.getStatus() != UserStatus.PENDING) {
            throw new InvalidAccountStateException();
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        token.setStatus(TokenStatus.USED);
        token.setUsedAt(Instant.now());
        emailVerificationTokenStore.save(token);

        log.info("Email verified successfully: userId={}", user.getId());

        return new MessageResponse("Xác nhận email thành công. Tài khoản đã được kích hoạt");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC01: Resend Verification
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse resendVerification(String email) {
        validateEmailDomain(email);

        String genericMessage = "Nếu email hợp lệ, bạn sẽ nhận được email xác nhận mới";

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || userOpt.get().getStatus() != UserStatus.PENDING) {
            return new MessageResponse(genericMessage);
        }

        User user = userOpt.get();

        emailVerificationTokenStore.invalidateActiveTokensByUserId(user.getId());

        String rawToken = TokenHashUtil.generateToken();
        byte[] tokenHash = TokenHashUtil.sha256(rawToken);

        EmailVerificationToken newToken = new EmailVerificationToken();
        newToken.setUserId(user.getId());
        newToken.setTokenHash(tokenHash);
        newToken.setStatus(TokenStatus.ACTIVE);
        newToken.setExpiresAt(Instant.now().plus(
                AuthConstants.EMAIL_VERIFICATION_TOKEN_EXPIRY_HOURS, ChronoUnit.HOURS));
        emailVerificationTokenStore.save(newToken);

        String verifyLink = String.format(authEmailProperties.verifyUrlTemplate(), rawToken);
        asyncEmailService.sendVerificationEmailAsync(email, verifyLink);

        log.info("Verification email resent for: email={}", email);

        return new MessageResponse(genericMessage);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC02: Login
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String email = request.email();
        String rawPassword = request.password();

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            recordFailedAttemptAndCheck(email);
            throw new InvalidCredentialsException();
        }

        User user = userOpt.get();

        accountValidationService.validateLoginable(user);

        LoginAttemptTracker tracker = loginAttemptTrackerStore.findByEmail(email)
                .orElseGet(() -> {
                    LoginAttemptTracker t = new LoginAttemptTracker();
                    t.setEmail(email);
                    return t;
                });

        if (tracker.isCurrentlyLocked()) {
            throw new AccountLockedException(tracker.remainingLockSeconds());
        }

        if (tracker.isWindowExpired(AuthConstants.LOCKOUT_DURATION_MINUTES)) {
            tracker.resetCounter();
        }

        if (!passwordEncoder.matches(rawPassword, user.getPasswordHash())) {
            tracker.recordFailedAttempt(
                    AuthConstants.MAX_FAILED_ATTEMPTS,
                    AuthConstants.LOCKOUT_DURATION_MINUTES);
            loginAttemptTrackerStore.save(tracker);

            log.warn("Failed login attempt: email={}, failedCount={}", email, tracker.getFailedCount());

            if (tracker.isCurrentlyLocked()) {
                throw new AccountLockedException(tracker.remainingLockSeconds());
            }
            throw new InvalidCredentialsException();
        }

        loginAttemptTrackerStore.resetByEmail(email);

        UUID sessionId = UUID.randomUUID();
        Instant now = Instant.now();
        Instant expiresAt = now.plusSeconds(authJwtProperties.expirationSeconds());

        AuthSession session = new AuthSession();
        session.setId(sessionId);
        session.setUserId(user.getId());
        session.setRole(user.getRole());
        session.setIssuedAt(now);
        session.setExpiresAt(expiresAt);
        session.setRevoked(false);
        sessionStore.save(session);

        String token = jwtTokenProvider.generateToken(user.getId(), user.getRole(), sessionId);

        log.info("Login successful: email={}, userId={}, sessionId={}", email, user.getId(), sessionId);

        return new LoginResponse(
                token,
                authJwtProperties.expirationSeconds(),
                new UserInfo(user.getRole())
        );
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC02: Logout
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse logout(UUID sessionId) {
        AuthSession session = sessionStore.findById(sessionId)
                .orElseThrow(SessionNotFoundException::new);

        if (session.isRevoked()) {
            throw new SessionRevokedException();
        }

        session.revoke();
        sessionStore.save(session);

        log.info("Logout successful: sessionId={}, userId={}", sessionId, session.getUserId());

        return new MessageResponse("Đăng xuất thành công");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC03b: Forgot Password — Request Reset
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse requestPasswordReset(String email) {
        validateEmailDomain(email);

        String genericMessage = "Nếu email hợp lệ, bạn sẽ nhận được link đặt lại mật khẩu";

        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty() || userOpt.get().getStatus() != UserStatus.ACTIVE) {
            log.debug("Forgot password: user not found or not ACTIVE — email={}", email);
            return new MessageResponse(genericMessage);
        }

        User user = userOpt.get();

        // Google-only user không có password → chặn forgot password
        if (user.getGoogleId() != null && user.getPasswordHash() == null) {
            log.debug("Forgot password: Google-only user — email={}", email);
            return new MessageResponse(
                    "Tài khoản này sử dụng Google Sign-In. Vui lòng đăng nhập bằng Google.");
        }

        Instant oneHourAgo = Instant.now().minus(1, ChronoUnit.HOURS);
        long recentCount = resetPasswordTokenStore.countRecentByUserId(user.getId(), oneHourAgo);

        if (recentCount >= AuthConstants.MAX_RESET_PASSWORD_REQUESTS_PER_HOUR) {
            log.warn("Forgot password rate limited: email={}, recentCount={}", email, recentCount);
            return new MessageResponse(genericMessage);
        }

        resetPasswordTokenStore.invalidateActiveTokensByUserId(user.getId());

        String rawToken = TokenHashUtil.generateToken();
        byte[] tokenHash = TokenHashUtil.sha256(rawToken);

        ResetPasswordToken resetToken = new ResetPasswordToken();
        resetToken.setUserId(user.getId());
        resetToken.setTokenHash(tokenHash);
        resetToken.setStatus(TokenStatus.ACTIVE);
        resetToken.setExpiresAt(Instant.now().plus(
                AuthConstants.RESET_PASSWORD_TOKEN_EXPIRY_HOURS, ChronoUnit.HOURS));
        resetPasswordTokenStore.save(resetToken);

        String resetLink = String.format(authEmailProperties.resetUrlTemplate(), rawToken);
        asyncEmailService.sendResetPasswordEmailAsync(email, resetLink);

        log.info("Reset password token created: email={}, userId={}", email, user.getId());

        return new MessageResponse(genericMessage);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // UC03b: Reset Password — Set New Password
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse resetPassword(String rawToken, String newPassword) {
        byte[] tokenHash = TokenHashUtil.sha256(rawToken);

        ResetPasswordToken resetToken = resetPasswordTokenStore.findByTokenHash(tokenHash)
                .orElseThrow(TokenNotFoundException::new);

        if (resetToken.getStatus() == TokenStatus.USED || resetToken.getStatus() == TokenStatus.INVALIDATED) {
            throw new TokenAlreadyUsedException();
        }

        if (resetToken.getExpiresAt().isBefore(Instant.now())) {
            throw new TokenExpiredException(
                    "Link đặt lại mật khẩu đã hết hạn. Vui lòng yêu cầu lại");
        }

        User user = userRepository.findById(resetToken.getUserId())
                .orElseThrow(UserNotFoundException::new);

        if (passwordEncoder.matches(newPassword, user.getPasswordHash())) {
            throw new SamePasswordException();
        }

        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        resetToken.setStatus(TokenStatus.USED);
        resetToken.setUsedAt(Instant.now());
        resetPasswordTokenStore.save(resetToken);

        sessionStore.revokeAllByUserId(user.getId());

        log.info("Password reset successful: userId={}", user.getId());

        return new MessageResponse("Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại");
    }

    // ─────────────────────────────────────────────────────────────────────────
    // DEV ONLY helpers
    // ─────────────────────────────────────────────────────────────────────────

    @Transactional
    public MessageResponse devActivateAccount(String email) {
        var userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            log.warn("[DEV] devActivateAccount: user not found — email={}", email);
            return new MessageResponse("[DEV] Không tìm thấy tài khoản với email: " + email);
        }

        User user = userOpt.get();

        if (user.getStatus() == UserStatus.ACTIVE) {
            log.info("[DEV] devActivateAccount: account already ACTIVE — email={}", email);
            return new MessageResponse("[DEV] Tài khoản đã ở trạng thái ACTIVE: " + email);
        }

        if (user.getStatus() != UserStatus.PENDING) {
            log.warn("[DEV] devActivateAccount: account not PENDING (status={}) — email={}",
                    user.getStatus(), email);
            return new MessageResponse("[DEV] Tài khoản không ở trạng thái PENDING: " + email);
        }

        user.setStatus(UserStatus.ACTIVE);
        userRepository.save(user);

        emailVerificationTokenStore.invalidateActiveTokensByUserId(user.getId());

        log.warn("[DEV] Account manually activated — email={}, userId={}", email, user.getId());

        return new MessageResponse("[DEV] Tài khoản đã được kích hoạt thành công: " + email);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // Private helpers
    // ─────────────────────────────────────────────────────────────────────────

    private static final Set<String> ALLOWED_DOMAINS = Set.of("library.com", "gmail.com");

    private void validateEmailDomain(String email) {
        if (!isAllowedEmailDomain(email)) {
            throw new InvalidEmailDomainException();
        }
    }

    private boolean isAllowedEmailDomain(String email) {
        String domain = email.substring(email.lastIndexOf('@') + 1).toLowerCase();
        return ALLOWED_DOMAINS.contains(domain);
    }

    private void recordFailedAttemptAndCheck(String email) {
        LoginAttemptTracker tracker = loginAttemptTrackerStore.findByEmail(email)
                .orElseGet(() -> {
                    LoginAttemptTracker t = new LoginAttemptTracker();
                    t.setEmail(email);
                    return t;
                });

        if (tracker.isCurrentlyLocked()) {
            throw new AccountLockedException(tracker.remainingLockSeconds());
        }

        if (tracker.isWindowExpired(AuthConstants.LOCKOUT_DURATION_MINUTES)) {
            tracker.resetCounter();
        }

        tracker.recordFailedAttempt(
                AuthConstants.MAX_FAILED_ATTEMPTS,
                AuthConstants.LOCKOUT_DURATION_MINUTES);
        loginAttemptTrackerStore.save(tracker);

        if (tracker.isCurrentlyLocked()) {
            throw new AccountLockedException(tracker.remainingLockSeconds());
        }
    }
}
