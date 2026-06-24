package com.library.auth.infrastructure.security;

import com.library.auth.domain.entity.AuthSession;
import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserStatus;
import com.library.auth.infrastructure.config.AuthJwtProperties;
import com.library.auth.infrastructure.persistence.SessionStore;
import com.library.auth.infrastructure.persistence.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final SessionStore sessionStore;
    private final AuthJwtProperties authJwtProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,
                                        HttpServletResponse response,
                                        Authentication authentication) throws IOException {
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = (String) oAuth2User.getAttributes().get("email");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found after OAuth2 login"));

        if (user.getStatus() != UserStatus.ACTIVE) {
            response.sendError(HttpServletResponse.SC_FORBIDDEN, "Account not active");
            return;
        }

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

        String frontendUrl = "http://localhost:5173";
        response.sendRedirect(frontendUrl + "/oauth2/redirect?token=" + token);

        log.info("OAuth2 login success, redirecting: userId={}", user.getId());
    }
}
