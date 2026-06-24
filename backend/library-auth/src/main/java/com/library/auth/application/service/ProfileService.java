package com.library.auth.application.service;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.exception.credential.InvalidOldPasswordException;
import com.library.auth.domain.exception.credential.SamePasswordException;
import com.library.auth.domain.exception.account.UserNotFoundException;
import com.library.auth.infrastructure.persistence.UserRepository;
import com.library.auth.presentation.dto.common.MessageResponse;
import com.library.auth.presentation.dto.profile.ChangePasswordRequest;
import com.library.auth.presentation.dto.profile.ProfileResponse;
import com.library.auth.presentation.dto.profile.UpdateProfileRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public ProfileResponse getProfile(UUID userId) {
        User user = findUserOrThrow(userId);

        ProfileResponse.ProfileResponseBuilder builder = ProfileResponse.builder()
                .name(user.getName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .address(user.getAddress())
                .joinedDate(user.getJoinedDate())
                .role(user.getRole())
                .borrowCount(null)
                .totalFines(null);

        if (user.getRole() == UserRole.READER) {
            builder.borrowCount(null);
            builder.totalFines(null);
        }

        log.debug("Profile loaded: userId={}, role={}", userId, user.getRole());
        return builder.build();
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserOrThrow(userId);

        user.setName(request.getName());
        user.setPhone(blankToNull(request.getPhone()));
        user.setAddress(blankToNull(request.getAddress()));

        userRepository.save(user);

        log.info("Profile updated: userId={}", userId);

        return getProfile(userId);
    }

    @Transactional
    public MessageResponse changePassword(UUID userId, ChangePasswordRequest request) {
        User user = findUserOrThrow(userId);

        if (!passwordEncoder.matches(request.getOldPassword(), user.getPasswordHash())) {
            log.warn("Change password failed — wrong old password: userId={}", userId);
            throw new InvalidOldPasswordException();
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            log.warn("Change password failed — new password same as old: userId={}", userId);
            throw new SamePasswordException();
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        log.info("Password changed successfully: userId={}", userId);

        return new MessageResponse("Đổi mật khẩu thành công");
    }

    private User findUserOrThrow(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.error("User not found in DB — edge case, userId={}", userId);
                    return new UserNotFoundException();
                });
    }

    private String blankToNull(String value) {
        return (value == null || value.isBlank()) ? null : value;
    }
}
