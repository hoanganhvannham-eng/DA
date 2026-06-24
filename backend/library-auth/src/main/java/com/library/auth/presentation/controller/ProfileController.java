package com.library.auth.presentation.controller;

import com.library.auth.application.service.ProfileService;
import com.library.auth.presentation.dto.common.MessageResponse;
import com.library.auth.presentation.dto.profile.ChangePasswordRequest;
import com.library.auth.presentation.dto.profile.ProfileResponse;
import com.library.auth.presentation.dto.profile.UpdateProfileRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/profile")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ResponseEntity<ProfileResponse> getProfile(Authentication authentication) {
        UUID userId = extractUserId(authentication);
        ProfileResponse profile = profileService.getProfile(userId);
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateProfile(
            Authentication authentication,
            @Valid @RequestBody UpdateProfileRequest request) {

        UUID userId = extractUserId(authentication);
        ProfileResponse updated = profileService.updateProfile(userId, request);
        return ResponseEntity.ok(updated);
    }

    @PutMapping("/password")
    public ResponseEntity<MessageResponse> changePassword(
            Authentication authentication,
            @Valid @RequestBody ChangePasswordRequest request) {

        UUID userId = extractUserId(authentication);
        MessageResponse response = profileService.changePassword(userId, request);
        return ResponseEntity.ok(response);
    }

    private UUID extractUserId(Authentication authentication) {
        return UUID.fromString((String) authentication.getPrincipal());
    }
}
