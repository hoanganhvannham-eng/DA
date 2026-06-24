package com.library.wallet.application.service;

import com.library.wallet.domain.entity.PaymentTransaction;
import com.library.wallet.domain.entity.Wallet;
import com.library.wallet.domain.entity.WalletTransaction;
import com.library.wallet.domain.enums.PaymentMethod;
import com.library.wallet.domain.enums.PaymentStatus;
import com.library.wallet.domain.enums.ReferenceType;
import com.library.wallet.domain.enums.TransactionType;
import com.library.wallet.domain.exception.InsufficientBalanceException;
import com.library.wallet.domain.exception.PaymentNotFoundException;
import com.library.wallet.domain.exception.PaymentNotInPendingStateException;
import com.library.wallet.domain.exception.WalletNotFoundException;
import com.library.wallet.infrastructure.persistence.PaymentTransactionRepository;
import com.library.wallet.infrastructure.persistence.WalletRepository;
import com.library.wallet.infrastructure.persistence.WalletTransactionRepository;
import com.library.wallet.presentation.dto.PaymentResponse;
import com.library.wallet.application.mapper.WalletMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import jakarta.persistence.LockModeType;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentTransactionRepository paymentTransactionRepository;
    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletMapper walletMapper;
    private final WalletService walletService;

    @Transactional
    public PaymentResponse createTopUpPayment(UUID userId, BigDecimal amount,
                                               PaymentMethod method, String redirectUrl) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        String paymentCode = generatePaymentCode();

        PaymentTransaction payment = PaymentTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .paymentCode(paymentCode)
                .method(method)
                .status(PaymentStatus.PENDING)
                .redirectUrl(redirectUrl)
                .expiredAt(Instant.now().plus(15, ChronoUnit.MINUTES))
                .build();
        paymentTransactionRepository.save(payment);

        String gatewayUrl = "/payment/mock/" + paymentCode;

        log.info("Payment created: userId={}, paymentCode={}, amount={}", userId, paymentCode, amount);

        return PaymentResponse.builder()
                .paymentCode(paymentCode)
                .gatewayUrl(gatewayUrl)
                .amount(amount)
                .status(PaymentStatus.PENDING.name())
                .expiredAt(payment.getExpiredAt())
                .build();
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentByCode(String paymentCode) {
        PaymentTransaction payment = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(PaymentNotFoundException::new);
        return walletMapper.toPaymentResponse(payment);
    }

    @Transactional
    public PaymentResponse completePayment(String paymentCode, String result) {
        PaymentTransaction payment = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(PaymentNotFoundException::new);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new PaymentNotInPendingStateException();
        }

        Wallet wallet = walletRepository.findByUserIdWithLock(payment.getWallet().getUserId())
                .orElseThrow(WalletNotFoundException::new);

        if ("SUCCESS".equalsIgnoreCase(result)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setCompletedAt(Instant.now());

            BigDecimal balanceBefore = wallet.getBalance();
            BigDecimal heldBefore = wallet.getHeldAmount();

            wallet.setBalance(wallet.getBalance().add(payment.getAmount()));
            walletRepository.save(wallet);

            WalletTransaction walletTransaction = WalletTransaction.builder()
                    .wallet(wallet)
                    .amount(payment.getAmount())
                    .type(TransactionType.TOP_UP)
                    .referenceType(ReferenceType.PAYMENT)
                    .referenceId(payment.getId())
                    .description("Nạp tiền online - " + paymentCode)
                    .balanceBefore(balanceBefore)
                    .balanceAfter(wallet.getBalance())
                    .heldBefore(heldBefore)
                    .heldAfter(wallet.getHeldAmount())
                    .build();
            walletTransactionRepository.save(walletTransaction);

            payment.setWalletTransaction(walletTransaction);

            log.info("Payment completed SUCCESS: paymentCode={}, amount={}, newBalance={}",
                    paymentCode, payment.getAmount(), wallet.getBalance());
        } else if ("FAILED".equalsIgnoreCase(result)) {
            payment.setStatus(PaymentStatus.FAILED);
            payment.setCompletedAt(Instant.now());
            log.info("Payment completed FAILED: paymentCode={}", paymentCode);
        } else {
            payment.setStatus(PaymentStatus.CANCELLED);
            payment.setCompletedAt(Instant.now());
            log.info("Payment CANCELLED: paymentCode={}", paymentCode);
        }

        paymentTransactionRepository.save(payment);

        String redirectUrl = payment.getRedirectUrl();
        if (redirectUrl != null && redirectUrl.contains("?")) {
            redirectUrl = redirectUrl + "&status=" + result.toLowerCase();
        } else if (redirectUrl != null) {
            redirectUrl = redirectUrl + "?status=" + result.toLowerCase();
        }

        return PaymentResponse.builder()
                .paymentCode(paymentCode)
                .gatewayUrl(null)
                .amount(payment.getAmount())
                .status(payment.getStatus().name())
                .redirectUrl(redirectUrl)
                .expiredAt(payment.getExpiredAt())
                .build();
    }

    @Transactional
    public void cancelPayment(String paymentCode) {
        PaymentTransaction payment = paymentTransactionRepository.findByPaymentCode(paymentCode)
                .orElseThrow(PaymentNotFoundException::new);

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new PaymentNotInPendingStateException();
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        payment.setCompletedAt(Instant.now());
        paymentTransactionRepository.save(payment);

        log.info("Payment cancelled: paymentCode={}", paymentCode);
    }

    @Transactional
    public void processExpiredPayments() {
        Instant now = Instant.now();
        List<PaymentTransaction> expiredPayments = paymentTransactionRepository
                .findByStatusAndExpiredAtBefore(PaymentStatus.PENDING, now);

        for (PaymentTransaction payment : expiredPayments) {
            payment.setStatus(PaymentStatus.EXPIRED);
            payment.setCompletedAt(now);
            paymentTransactionRepository.save(payment);
            log.info("Payment expired: paymentCode={}", payment.getPaymentCode());
        }
    }

    private String generatePaymentCode() {
        String datePart = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh"))
                .format(DateTimeFormatter.BASIC_ISO_DATE);
        String randomPart = UUID.randomUUID().toString()
                .substring(0, 6)
                .toUpperCase();
        return "PMT-" + datePart + "-" + randomPart;
    }
}
