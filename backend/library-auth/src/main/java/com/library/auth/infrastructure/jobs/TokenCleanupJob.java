package com.library.auth.infrastructure.jobs;

import com.library.auth.infrastructure.persistence.EmailVerificationTokenStore;
import com.library.auth.infrastructure.persistence.ResetPasswordTokenStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Slf4j
@Component
@RequiredArgsConstructor
public class TokenCleanupJob {

    private final EmailVerificationTokenStore emailVerificationTokenStore;
    private final ResetPasswordTokenStore resetPasswordTokenStore;

    @Scheduled(fixedRate = 1_800_000)
    @Transactional
    public void cleanUpExpiredTokens() {
        Instant now = Instant.now();

        int expiredEmailTokens = emailVerificationTokenStore.expireActiveTokensBefore(now);
        int expiredResetTokens = resetPasswordTokenStore.expireActiveTokensBefore(now);

        if (expiredEmailTokens > 0 || expiredResetTokens > 0) {
            log.info("TokenCleanupJob: expired {} email tokens, {} reset tokens",
                    expiredEmailTokens, expiredResetTokens);
        } else {
            log.debug("TokenCleanupJob: no expired tokens to clean up");
        }
    }
}
