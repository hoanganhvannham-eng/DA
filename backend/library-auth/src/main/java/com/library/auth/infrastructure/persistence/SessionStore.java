package com.library.auth.infrastructure.persistence;

import com.library.auth.domain.entity.AuthSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SessionStore extends JpaRepository<AuthSession, UUID> {

    @Query("SELECT s FROM AuthSession s WHERE s.id = :id AND s.revoked = false AND s.expiresAt > :now")
    Optional<AuthSession> findValidById(@Param("id") UUID id, @Param("now") Instant now);

    @Modifying
    @Query("UPDATE AuthSession s SET s.revoked = true, s.revokedAt = CURRENT_TIMESTAMP " +
           "WHERE s.userId = :userId AND s.revoked = false")
    void revokeAllByUserId(@Param("userId") UUID userId);

    default void revokeByToken(String token) {
        throw new UnsupportedOperationException("Use jti-based revocation via findById() instead");
    }
}
