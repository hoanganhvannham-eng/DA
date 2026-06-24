package com.library.fine.presentation.controller;

import com.library.fine.application.service.FinePaymentService;
import com.library.fine.presentation.dto.FineTicketDTO;
import com.library.fine.presentation.dto.response.FineListResponse;
import com.library.fine.presentation.dto.response.PayFineResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fines")
@RequiredArgsConstructor
public class FinePaymentController {

    private final FinePaymentService finePaymentService;

    @GetMapping("/my-fines")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<FineListResponse> getMyFines(Authentication authentication) {
        UUID readerId = getCurrentUserId(authentication);
        List<FineTicketDTO> fines = finePaymentService.getReaderFines(readerId);
        return ResponseEntity.ok(FineListResponse.builder().fines(fines).build());
    }

    @PostMapping("/{fineId}/pay")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<PayFineResponse> payFine(
            @PathVariable UUID fineId,
            @RequestParam("proof_image") MultipartFile proofImage,
            @RequestParam(value = "idempotency_key", required = false) String idempotencyKey,
            Authentication authentication) {

        UUID readerId = getCurrentUserId(authentication);
        PayFineResponse response = finePaymentService.payFine(fineId, readerId, proofImage, idempotencyKey);
        return ResponseEntity.ok(response);
    }

    private UUID getCurrentUserId(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof com.library.common.security.CurrentUser currentUser) {
            return currentUser.id();
        }
        return UUID.fromString(authentication.getName());
    }
}
