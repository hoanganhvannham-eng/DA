package com.library.auth.infrastructure.persistence;

import com.library.auth.domain.entity.LoginAttemptTracker;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LoginAttemptTrackerStore extends JpaRepository<LoginAttemptTracker, String> {

    default Optional<LoginAttemptTracker> findByEmail(String email) {
        return findById(email);
    }

    default void resetByEmail(String email) {
        findById(email).ifPresent(tracker -> {
            tracker.resetCounter();
            save(tracker);
        });
    }
}
