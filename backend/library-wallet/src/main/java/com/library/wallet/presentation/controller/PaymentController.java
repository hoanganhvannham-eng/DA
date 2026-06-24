package com.library.wallet.presentation.controller;

import com.library.common.security.CurrentUser;
import com.library.wallet.application.service.PaymentService;
import com.library.wallet.domain.enums.PaymentMethod;
import com.library.wallet.presentation.dto.PaymentRequest;
import com.library.wallet.presentation.dto.PaymentResponse;
import com.library.wallet.presentation.dto.PaymentCallbackRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/top-up")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<PaymentResponse> createTopUpPayment(
            CurrentUser currentUser,
            @Valid @RequestBody PaymentRequest request) {
        PaymentResponse response = paymentService.createTopUpPayment(
                currentUser.id(),
                request.getAmount(),
                PaymentMethod.MOCK,
                request.getRedirectUrl()
        );
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/{paymentCode}")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<PaymentResponse> getPayment(@PathVariable String paymentCode) {
        PaymentResponse response = paymentService.getPaymentByCode(paymentCode);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/mock-callback")
    public ResponseEntity<PaymentResponse> mockCallback(
            @Valid @RequestBody PaymentCallbackRequest request) {
        PaymentResponse response = paymentService.completePayment(
                request.getPaymentCode(),
                request.getResult()
        );
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{paymentCode}/cancel")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<Void> cancelPayment(@PathVariable String paymentCode) {
        paymentService.cancelPayment(paymentCode);
        return ResponseEntity.ok().build();
    }
}
