package com.library.wallet.presentation.controller;

import com.library.common.security.CurrentUser;
import com.library.wallet.application.service.WalletService;
import com.library.wallet.presentation.dto.WalletResponse;
import com.library.wallet.presentation.dto.TopUpRequest;
import com.library.wallet.presentation.dto.TopUpResponse;
import com.library.wallet.presentation.dto.WithdrawRequest;
import com.library.wallet.presentation.dto.TransactionHistoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/wallet")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;

    @GetMapping
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<WalletResponse> getWallet(CurrentUser currentUser) {
        WalletResponse response = walletService.getWallet(currentUser.id());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/top-up")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<TopUpResponse> topUp(CurrentUser currentUser,
                                                @Valid @RequestBody TopUpRequest request) {
        walletService.topUp(currentUser.id(), request.getAmount(),
                request.getDescription() != null ? request.getDescription() : "Nạp tiền tại quầy");

        WalletResponse wallet = walletService.getWallet(currentUser.id());
        TopUpResponse response = TopUpResponse.builder()
                .amount(request.getAmount())
                .newBalance(wallet.getBalance())
                .message("Nạp tiền thành công")
                .build();
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/withdraw")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<TopUpResponse> withdraw(CurrentUser currentUser,
                                                   @Valid @RequestBody WithdrawRequest request) {
        walletService.withdraw(currentUser.id(), request.getAmount(),
                request.getDescription() != null ? request.getDescription() : "Rút tiền mặt");

        WalletResponse wallet = walletService.getWallet(currentUser.id());
        TopUpResponse response = TopUpResponse.builder()
                .amount(request.getAmount())
                .newBalance(wallet.getBalance())
                .message("Rút tiền thành công")
                .build();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/transactions")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<Page<TransactionHistoryResponse>> getTransactions(
            CurrentUser currentUser,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<TransactionHistoryResponse> transactions =
                walletService.getTransactionHistory(currentUser.id(), PageRequest.of(page, size));
        return ResponseEntity.ok(transactions);
    }
}
