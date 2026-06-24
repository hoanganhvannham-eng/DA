package com.library.auth.infrastructure.security;

import com.library.auth.infrastructure.config.AuthJwtProperties;
import com.library.auth.domain.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.UUID;

@Slf4j
@Component
public class JwtTokenProvider {

    private static final String CLAIM_ROLE = "role";

    private final AuthJwtProperties jwtProperties;
    private final SecretKey signingKey;

    public JwtTokenProvider(AuthJwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
        this.signingKey = Keys.hmacShaKeyFor(
                jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(UUID userId, UserRole role, UUID sessionId) {
        Instant now = Instant.now();
        Instant expiry = now.plusSeconds(jwtProperties.expirationSeconds());

        return Jwts.builder()
                .subject(userId.toString())
                .claim(CLAIM_ROLE, role.name())
                .id(sessionId.toString())
                .issuer(jwtProperties.issuer())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiry))
                .signWith(signingKey)
                .compact();
    }

    public Claims parseAndValidate(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .requireIssuer(jwtProperties.issuer())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public Claims parseQuietly(String token) {
        try {
            return parseAndValidate(token);
        } catch (JwtException | IllegalArgumentException ex) {
            log.debug("JWT parse failed: {}", ex.getMessage());
            return null;
        }
    }

    public UUID extractUserId(Claims claims) {
        return UUID.fromString(claims.getSubject());
    }

    public UserRole extractRole(Claims claims) {
        return UserRole.valueOf(claims.get(CLAIM_ROLE, String.class));
    }

    public UUID extractSessionId(Claims claims) {
        return UUID.fromString(claims.getId());
    }
}
