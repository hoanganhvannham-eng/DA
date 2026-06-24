package com.library.shipping.presentation.controller;

import com.library.shipping.application.service.DeliveryConfirmationService;
import com.library.shipping.presentation.dto.request.ReportIssueRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;
import java.util.regex.Pattern;

@Slf4j
@RestController
@RequestMapping("/api/v1/borrows")
@RequiredArgsConstructor
@Validated
public class DeliveryConfirmationController {

    private static final Pattern UUID_PATTERN =
            Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");

    private final DeliveryConfirmationService deliveryConfirmationService;

    @PatchMapping("/{borrowId}/confirm-delivery")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<Map<String, Object>> confirmReceived(
            @PathVariable UUID borrowId,
            Authentication authentication) {
        UUID readerId = extractUserId(authentication);
        Map<String, Object> result = deliveryConfirmationService.confirmDeliveryReceived(borrowId, readerId);
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/{borrowId}/report-issue")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<Map<String, Object>> reportNotReceived(
            @PathVariable UUID borrowId,
            @Valid @RequestBody ReportIssueRequest request,
            Authentication authentication) {
        UUID readerId = extractUserId(authentication);
        Map<String, Object> result = deliveryConfirmationService.reportDeliveryIssue(borrowId, readerId, request);
        return ResponseEntity.ok(result);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            log.warn("Authentication is null or not authenticated");
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.library.auth.domain.entity.User user) {
            return user.getId();
        }
        String name = authentication.getName();
        if (name != null && UUID_PATTERN.matcher(name).matches()) {
            return UUID.fromString(name);
        }
        log.warn("Could not extract user ID from authentication: name={}", name);
        return null;
    }
}
