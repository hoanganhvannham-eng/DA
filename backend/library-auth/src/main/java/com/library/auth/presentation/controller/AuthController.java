package com.library.auth.presentation.controller;

import com.library.auth.application.service.AuthService;
import com.library.auth.infrastructure.security.JwtTokenProvider;
import com.library.auth.presentation.dto.auth.ForgotPasswordRequest;
import com.library.auth.presentation.dto.auth.LoginRequest;
import com.library.auth.presentation.dto.auth.LoginResponse;
import com.library.auth.presentation.dto.auth.RegisterRequest;
import com.library.auth.presentation.dto.auth.RegisterResponse;
import com.library.auth.presentation.dto.auth.ResendVerificationRequest;
import com.library.auth.presentation.dto.auth.ResetPasswordRequest;
import com.library.auth.presentation.dto.common.MessageResponse;
import io.jsonwebtoken.Claims;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request) {

        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/verify-email")
    public ResponseEntity<MessageResponse> verifyEmail(
            @RequestParam("token") String token) {

        MessageResponse response = authService.verifyEmail(token);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/resend-verification")
    public ResponseEntity<MessageResponse> resendVerification(
            @Valid @RequestBody ResendVerificationRequest request) {

        MessageResponse response = authService.resendVerification(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(
            @RequestHeader("Authorization") String authorizationHeader) {

        String token = authorizationHeader.substring("Bearer ".length());
        Claims claims = jwtTokenProvider.parseAndValidate(token);
        UUID sessionId = jwtTokenProvider.extractSessionId(claims);

        MessageResponse response = authService.logout(sessionId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<MessageResponse> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequest request) {

        MessageResponse response = authService.requestPasswordReset(request.getEmail());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<MessageResponse> resetPassword(
            @Valid @RequestBody ResetPasswordRequest request) {

        MessageResponse response = authService.resetPassword(
                request.getToken(), request.getNewPassword());
        return ResponseEntity.ok(response);
    }
}
