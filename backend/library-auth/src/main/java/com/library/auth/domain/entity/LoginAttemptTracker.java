package com.library.auth.domain.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "login_attempt_trackers")
@Getter
@Setter
@NoArgsConstructor
public class LoginAttemptTracker {

    @Id
    @Column(name = "email", length = 254, nullable = false)
    private String email;

    @Column(name = "failed_count", nullable = false)
    private int failedCount = 0;

    @Column(name = "first_failed_at")
    private Instant firstFailedAt;

    @Column(name = "locked_until")
    private Instant lockedUntil;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }

    public boolean isCurrentlyLocked() {
        return lockedUntil != null && lockedUntil.isAfter(Instant.now());
    }

    public boolean isWindowExpired(long windowMinutes) {
        if (firstFailedAt == null) return false;
        return firstFailedAt.plusSeconds(windowMinutes * 60).isBefore(Instant.now());
    }

    public void resetCounter() {
        this.failedCount = 0;
        this.firstFailedAt = null;
        this.lockedUntil = null;
    }

    public void recordFailedAttempt(int maxAttempts, long lockMinutes) {
        Instant now = Instant.now();
        this.failedCount++;
        if (this.firstFailedAt == null) {
            this.firstFailedAt = now;
        }
        if (this.failedCount >= maxAttempts) {
            this.lockedUntil = this.firstFailedAt.plusSeconds(lockMinutes * 60);
        }
    }

    public long remainingLockSeconds() {
        if (!isCurrentlyLocked()) return 0L;
        return lockedUntil.getEpochSecond() - Instant.now().getEpochSecond();
    }
}
