package com.library.shipping.presentation.controller;

import com.library.shipping.application.dto.CancelBorrowResult;
import com.library.shipping.application.service.CancelBorrowService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/borrows")
@RequiredArgsConstructor
@Validated
public class CancelBorrowController {

    private final CancelBorrowService cancelBorrowService;

    @PostMapping("/{borrowId}/cancel")
    @PreAuthorize("hasAnyRole('READER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<CancelBorrowResult> cancelBorrow(
            @PathVariable UUID borrowId,
            Authentication authentication) {

        UUID actorId = extractUserId(authentication);
        boolean isLibrarian = authentication != null
                && authentication.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_LIBRARIAN")
                                || a.getAuthority().equals("ROLE_ADMIN"));

        CancelBorrowResult result = cancelBorrowService.cancelBorrow(borrowId, actorId, isLibrarian);
        return ResponseEntity.ok(result);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.library.auth.domain.entity.User user) {
            return user.getId();
        }
        String name = authentication.getName();
        try {
            return UUID.fromString(name);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
