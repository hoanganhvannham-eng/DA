package com.library.auth.presentation.controller;

import com.library.auth.application.service.AuthService;
import com.library.auth.presentation.dto.common.MessageResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/dev/auth")
@RequiredArgsConstructor
@Profile({"dev", "local"})
public class DevAuthController {

    private final AuthService authService;

    @PostMapping("/activate")
    public ResponseEntity<MessageResponse> activateAccount(
            @RequestParam String email) {

        log.warn("[DEV] Manual account activation requested — email={}", email);
        MessageResponse response = authService.devActivateAccount(email);
        return ResponseEntity.ok(response);
    }
}
