package com.library.wallet.application.mapper;

import com.library.wallet.domain.entity.PaymentTransaction;
import com.library.wallet.domain.entity.Wallet;
import com.library.wallet.domain.entity.WalletTransaction;
import com.library.wallet.presentation.dto.PaymentResponse;
import com.library.wallet.presentation.dto.WalletResponse;
import com.library.wallet.presentation.dto.TransactionHistoryResponse;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;

@Component
public class WalletMapper {

    public WalletResponse toResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .userId(wallet.getUserId())
                .balance(wallet.getBalance())
                .heldAmount(wallet.getHeldAmount())
                .availableBalance(wallet.getAvailableBalance())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }

    public TransactionHistoryResponse toTransactionHistory(WalletTransaction transaction) {
        return TransactionHistoryResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType().name())
                .referenceType(transaction.getReferenceType() != null
                        ? transaction.getReferenceType().name() : null)
                .referenceId(transaction.getReferenceId())
                .description(transaction.getDescription())
                .balanceBefore(transaction.getBalanceBefore())
                .balanceAfter(transaction.getBalanceAfter())
                .heldBefore(transaction.getHeldBefore())
                .heldAfter(transaction.getHeldAfter())
                .createdAt(transaction.getCreatedAt())
                .build();
    }

    public PaymentResponse toPaymentResponse(PaymentTransaction payment) {
        return PaymentResponse.builder()
                .paymentCode(payment.getPaymentCode())
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .redirectUrl(payment.getRedirectUrl())
                .expiredAt(payment.getExpiredAt())
                .build();
    }
}
