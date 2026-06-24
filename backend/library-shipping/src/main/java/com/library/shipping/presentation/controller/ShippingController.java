package com.library.shipping.presentation.controller;

import com.library.shipping.application.dto.CreateShipmentResult;
import com.library.shipping.application.dto.DeliveryIssueDTO;
import com.library.shipping.application.dto.HandleIssueResult;
import com.library.shipping.application.service.DeliveryIssueService;
import com.library.shipping.application.service.ShippingService;
import com.library.shipping.presentation.dto.request.HandleIssueRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/borrows")
@RequiredArgsConstructor
@Validated
public class ShippingController {

    private final ShippingService shippingService;
    private final DeliveryIssueService deliveryIssueService;

    @PostMapping("/{borrowId}/shipments")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<CreateShipmentResult> createShipment(
            @PathVariable UUID borrowId,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        CreateShipmentResult result = shippingService.createShipment(borrowId, librarianId);
        return ResponseEntity.status(HttpStatus.CREATED).body(result);
    }

    @PostMapping("/{borrowId}/handle-issue")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<HandleIssueResult> handleIssue(
            @PathVariable UUID borrowId,
            @Valid @RequestBody HandleIssueRequest request,
            Authentication authentication) {

        log.info("Handle delivery issue: borrowId={}, action={}, notes={}, replacementBookId={}",
                borrowId, request.getAction(), request.getNotes(), request.getReplacementBookId());

        HandleIssueResult result = deliveryIssueService.handle(
                borrowId, request.getAction(), request.getNotes(), request.getReplacementBookId());

        return ResponseEntity.ok(result);
    }

    @GetMapping("/delivery-issues")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<DeliveryIssueDTO>> getDeliveryIssues(Pageable pageable) {
        return ResponseEntity.ok(deliveryIssueService.getDeliveryIssues(pageable));
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
