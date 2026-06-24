package com.library.borrow.infrastructure.persistence;

import com.library.auth.domain.entity.User;
import com.library.auth.infrastructure.persistence.UserRepository;
import com.library.borrow.domain.port.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class UserProfileRepositoryAdapter implements UserProfileRepository {

    private final UserRepository userRepository;

    @Override
    public String getNameByUserId(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getName)
                .orElse(null);
    }

    @Override
    public String getAddressByUserId(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getAddress)
                .orElse(null);
    }

    @Override
    public Instant getJoinedDateByUserId(UUID userId) {
        return userRepository.findById(userId)
                .map(User::getJoinedDate)
                .orElse(null);
    }
}
