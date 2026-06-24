package com.library.auth.infrastructure.persistence;

import com.library.auth.domain.entity.EmailVerificationToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmailVerificationTokenStore extends JpaRepository<EmailVerificationToken, UUID> {

    Optional<EmailVerificationToken> findByTokenHash(byte[] tokenHash);

    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.status = 'INVALIDATED', t.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE t.userId = :userId AND t.status = 'ACTIVE'")
    int invalidateActiveTokensByUserId(@Param("userId") UUID userId);

    @Modifying
    @Query("UPDATE EmailVerificationToken t SET t.status = 'EXPIRED', t.updatedAt = CURRENT_TIMESTAMP " +
           "WHERE t.status = 'ACTIVE' AND t.expiresAt < :cutoff")
    int expireActiveTokensBefore(@Param("cutoff") Instant cutoff);
}
