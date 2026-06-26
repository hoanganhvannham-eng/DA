package com.library.wallet.application.service;

import com.library.wallet.domain.entity.Wallet;
import com.library.wallet.domain.entity.WalletTransaction;
import com.library.wallet.domain.enums.ReferenceType;
import com.library.wallet.domain.enums.TransactionType;
import com.library.wallet.domain.exception.InsufficientBalanceException;
import com.library.wallet.domain.exception.WalletNotFoundException;
import com.library.wallet.infrastructure.persistence.WalletRepository;
import com.library.wallet.infrastructure.persistence.WalletTransactionRepository;
import com.library.wallet.presentation.dto.WalletResponse;
import com.library.wallet.presentation.dto.TransactionHistoryResponse;
import com.library.wallet.application.mapper.WalletMapper;
import com.library.wallet.domain.event.WalletTopUpEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final WalletMapper walletMapper;
    private final ApplicationEventPublisher eventPublisher;

    @Transactional(readOnly = true)
    public WalletResponse getWallet(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);
        return walletMapper.toResponse(wallet);
    }

    @Transactional(readOnly = true)
    public BigDecimal getBalance(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);
        return wallet.getBalance();
    }

    @Transactional(readOnly = true)
    public BigDecimal getAvailableBalance(UUID userId) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);
        return wallet.getAvailableBalance();
    }

    @Transactional
    public void topUp(UUID userId, BigDecimal amount, String description) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal heldBefore = wallet.getHeldAmount();

        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepository.save(wallet);

        createTransaction(wallet, amount, TransactionType.TOP_UP, null, null,
                description, balanceBefore, wallet.getBalance(), heldBefore, wallet.getHeldAmount());

        log.info("Wallet top-up: userId={}, amount={}, newBalance={}", userId, amount, wallet.getBalance());

        eventPublisher.publishEvent(new WalletTopUpEvent(userId, amount));
    }

    @Transactional
    public void deduct(UUID userId, BigDecimal amount, TransactionType type,
                       ReferenceType refType, UUID refId, String description) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
            throw new InsufficientBalanceException(
                    "Số dư không đủ. Cần: " + amount + ", có: " + wallet.getAvailableBalance());
        }

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal heldBefore = wallet.getHeldAmount();

        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        createTransaction(wallet, amount, type, refType, refId,
                description, balanceBefore, wallet.getBalance(), heldBefore, wallet.getHeldAmount());

        log.info("Wallet deduct: userId={}, amount={}, type={}, newBalance={}",
                userId, amount, type, wallet.getBalance());
    }

    @Transactional
        public void hold(UUID userId, BigDecimal amount, ReferenceType refType,
                        UUID refId, String description) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        if (wallet.getAvailableBalance().compareTo(amount) < 0) {
                throw new InsufficientBalanceException(
                        "Số dư khả dụng không đủ. Cần: " + amount + ", có: " + wallet.getAvailableBalance());
        }

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal heldBefore = wallet.getHeldAmount();

        wallet.setHeldAmount(wallet.getHeldAmount().add(amount));
        walletRepository.save(wallet);

        // Chỉ tạo transaction khi amount > 0, tránh vi phạm constraint DB
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
                createTransaction(wallet, amount, TransactionType.DEPOSIT_HOLD, refType, refId,
                        description, balanceBefore, wallet.getBalance(), heldBefore, wallet.getHeldAmount());
        }

        log.info("Wallet hold: userId={}, amount={}, newHeldAmount={}",
                userId, amount, wallet.getHeldAmount());
        }

    
    @Transactional
        public void releaseHold(UUID userId, BigDecimal amount, ReferenceType refType,
                                UUID refId, String description) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal heldBefore = wallet.getHeldAmount();

        wallet.setHeldAmount(wallet.getHeldAmount().subtract(amount));
        walletRepository.save(wallet);

        // Chỉ tạo transaction khi amount > 0, tránh vi phạm constraint DB
        if (amount.compareTo(BigDecimal.ZERO) > 0) {
                createTransaction(wallet, amount, TransactionType.DEPOSIT_RELEASE, refType, refId,
                        description, balanceBefore, wallet.getBalance(), heldBefore, wallet.getHeldAmount());
        }

        log.info("Wallet releaseHold: userId={}, amount={}, newHeldAmount={}",
                userId, amount, wallet.getHeldAmount());
        }

    @Transactional
    public void deductHeld(UUID userId, BigDecimal amount, TransactionType type,
                           ReferenceType refType, UUID refId, String description) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);

        BigDecimal balanceBefore = wallet.getBalance();
        BigDecimal heldBefore = wallet.getHeldAmount();

        wallet.setHeldAmount(wallet.getHeldAmount().subtract(amount));
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        createTransaction(wallet, amount, type, refType, refId,
                description, balanceBefore, wallet.getBalance(), heldBefore, wallet.getHeldAmount());

        log.info("Wallet deductHeld: userId={}, amount={}, type={}, newBalance={}, newHeld={}",
                userId, amount, type, wallet.getBalance(), wallet.getHeldAmount());
    }

    @Transactional(readOnly = true)
    public boolean checkSufficientAvailable(UUID userId, BigDecimal requiredAmount) {
        Wallet wallet = walletRepository.findByUserId(userId)
                .orElseThrow(WalletNotFoundException::new);
        return wallet.getAvailableBalance().compareTo(requiredAmount) >= 0;
    }

    @Transactional
    public void withdraw(UUID userId, BigDecimal amount, String description) {
        deduct(userId, amount, TransactionType.WITHDRAWAL, null, null, description);
        log.info("Wallet withdraw: userId={}, amount={}", userId, amount);
    }

    @Transactional(readOnly = true)
    public Wallet findByUserIdWithLock(UUID userId) {
        return walletRepository.findByUserIdWithLock(userId)
                .orElseThrow(WalletNotFoundException::new);
    }

    @Transactional(readOnly = true)
    public Page<TransactionHistoryResponse> getTransactionHistory(UUID userId, Pageable pageable) {
        return walletTransactionRepository.findByUserId(userId, pageable)
                .map(walletMapper::toTransactionHistory);
    }

    @Transactional
    public void createWalletForUser(UUID userId) {
        if (walletRepository.existsByUserId(userId)) {
            return;
        }
        Wallet wallet = Wallet.builder()
                .userId(userId)
                .balance(BigDecimal.ZERO)
                .heldAmount(BigDecimal.ZERO)
                .build();
        walletRepository.save(wallet);
        log.info("Wallet created for new user: userId={}", userId);
    }

    private void createTransaction(Wallet wallet, BigDecimal amount, TransactionType type,
                                    ReferenceType refType, UUID refId, String description,
                                    BigDecimal balanceBefore, BigDecimal balanceAfter,
                                    BigDecimal heldBefore, BigDecimal heldAfter) {
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .amount(amount)
                .type(type)
                .referenceType(refType)
                .referenceId(refId)
                .description(description)
                .balanceBefore(balanceBefore)
                .balanceAfter(balanceAfter)
                .heldBefore(heldBefore)
                .heldAfter(heldAfter)
                .build();
        walletTransactionRepository.save(transaction);
    }
}
