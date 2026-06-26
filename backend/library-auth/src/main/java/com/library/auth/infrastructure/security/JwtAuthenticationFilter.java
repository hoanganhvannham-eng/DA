package com.library.auth.infrastructure.security;

import com.library.auth.domain.entity.AuthSession;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.infrastructure.persistence.SessionStore;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String AUTHORIZATION_HEADER = "Authorization";
    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtTokenProvider jwtTokenProvider;
    private final SessionStore sessionStore;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        log.info("🔍 shouldNotFilter check: uri={}", request.getRequestURI());
        return false;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain)
            throws ServletException, IOException {

        log.info("🟢 JwtAuthenticationFilter ENTERED: method={}, uri={}", request.getMethod(), request.getRequestURI());

        String authHeader = request.getHeader(AUTHORIZATION_HEADER);
        if (authHeader == null || !authHeader.startsWith(BEARER_PREFIX)) {
            log.info("🚫 No Authorization header or wrong prefix: uri={}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        String token = authHeader.substring(BEARER_PREFIX.length());

        Claims claims = jwtTokenProvider.parseQuietly(token);
        if (claims == null) {
            log.info("🚫 JWT parse failed for request: {}", request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        UUID sessionId = jwtTokenProvider.extractSessionId(claims);
        Optional<AuthSession> sessionOpt = sessionStore.findValidById(sessionId, Instant.now());

        if (sessionOpt.isEmpty()) {
            log.info("🚫 JWT session invalid or revoked: jti={}, uri={}", sessionId, request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }

        UUID userId = jwtTokenProvider.extractUserId(claims);
        UserRole role = jwtTokenProvider.extractRole(claims);
        String authority = "ROLE_" + role.name();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                userId.toString(),
                null,
                List.of(new SimpleGrantedAuthority(authority)));
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        log.info("🔐 JWT authentication set: userId={}, role={}, authority={}, uri={}", userId, role, authority,
                request.getRequestURI());

        filterChain.doFilter(request, response);
    }
}
