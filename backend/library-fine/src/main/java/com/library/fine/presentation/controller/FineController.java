package com.library.fine.presentation.controller;

import com.library.fine.application.service.FineTicketService;
import com.library.fine.presentation.dto.request.RejectPaymentRequest;
import com.library.fine.presentation.dto.response.ConfirmPaymentResponse;
import com.library.fine.presentation.dto.response.FineDetailResponse;
import com.library.fine.presentation.dto.response.PayFineFromWalletResponse;
import com.library.fine.presentation.dto.response.RejectPaymentResponse;
import com.library.fine.presentation.dto.FineTicketDetailDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fines")
@RequiredArgsConstructor
public class FineController {

    private final FineTicketService fineTicketService;

    @GetMapping("/pending-confirmation")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<Page<FineTicketDetailDTO>> getPendingConfirmFines(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(fineTicketService.getPendingConfirmFines(pageable));
    }

    @GetMapping("/{fineId}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<FineDetailResponse> getFineDetail(@PathVariable UUID fineId) {
        return ResponseEntity.ok(fineTicketService.getFineDetail(fineId));
    }

    @PatchMapping("/{fineId}/confirm")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<ConfirmPaymentResponse> confirmPayment(
            @PathVariable UUID fineId,
            Authentication authentication) {

        UUID librarianId = getCurrentUserId(authentication);
        return ResponseEntity.ok(fineTicketService.confirmPayment(fineId, librarianId));
    }

    @PatchMapping("/{fineId}/reject")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<RejectPaymentResponse> rejectPayment(
            @PathVariable UUID fineId,
            @Valid @RequestBody RejectPaymentRequest request,
            Authentication authentication) {

        UUID librarianId = getCurrentUserId(authentication);
        return ResponseEntity.ok(fineTicketService.rejectPayment(fineId, request.getRejectionReason(), librarianId));
    }

    @PostMapping("/{fineId}/pay-from-wallet")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<PayFineFromWalletResponse> payFromWallet(
            @PathVariable UUID fineId,
            Authentication authentication) {

        UUID readerId = getCurrentUserId(authentication);
        return ResponseEntity.ok(fineTicketService.payFineFromWallet(fineId, readerId));
    }

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.library.common.security.CurrentUser currentUser) {
            return currentUser.id();
        }
        return UUID.fromString(authentication.getName());
    }
}
