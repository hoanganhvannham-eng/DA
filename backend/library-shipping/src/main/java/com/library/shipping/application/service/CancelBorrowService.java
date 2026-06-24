package com.library.shipping.application.service;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.exception.BorrowAccessForbiddenException;
import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.exception.InvalidStatusTransitionException;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.shipping.application.dto.CancelBorrowResult;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.exception.BorrowShippingAlreadyStartedException;
import com.library.shipping.domain.port.NotificationService;
import com.library.shipping.domain.port.ShippingOrderRepository;
import com.library.wallet.application.service.WalletService;
import com.library.wallet.domain.enums.ReferenceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class CancelBorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final ShippingOrderRepository shippingOrderRepository;
    private final ShippingStatusLogService shippingStatusLogService;
    private final NotificationService notificationService;
    private final WalletService walletService;

    @Transactional
    public CancelBorrowResult cancelBorrow(UUID borrowId, UUID actorId, boolean isLibrarian) {
        BorrowRecord borrow = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Cancel failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (!isLibrarian && !borrow.getReaderId().equals(actorId)) {
            log.warn("Cancel failed: reader {} tried to cancel borrow {} of another reader", actorId, borrowId);
            throw new BorrowAccessForbiddenException();
        }

        BorrowStatus status = borrow.getStatus();
        if (status != BorrowStatus.PENDING_APPROVAL
                && status != BorrowStatus.AWAITING_PICKUP
                && status != BorrowStatus.AWAITING_SHIPMENT
                && status != BorrowStatus.APPROVED_WAITING_PAYMENT) {
            log.warn("Cancel failed: borrow id={} status={} not cancellable", borrowId, status);
            throw new InvalidStatusTransitionException();
        }

        if (status == BorrowStatus.AWAITING_SHIPMENT) {
            Optional<ShippingOrder> activeShipping = shippingOrderRepository.findActiveByBorrowRecordId(borrowId);
            if (activeShipping.isPresent()) {
                ShippingOrder shipping = activeShipping.get();
                if (shipping.getStatus() == ShippingOrderStatus.PICKED_UP
                        || shipping.getStatus() == ShippingOrderStatus.IN_TRANSIT) {
                    log.warn("Cancel failed: borrow id={} shipping already started (status={})",
                            borrowId, shipping.getStatus());
                    throw new BorrowShippingAlreadyStartedException();
                }
                if (shipping.getStatus() == ShippingOrderStatus.CREATED) {
                    shippingOrderRepository.updateStatus(
                            shipping.getId(), ShippingOrderStatus.CANCELLED, Instant.now());
                    shippingStatusLogService.logStatusChange(
                            shipping.getId(), ShippingOrderStatus.CREATED,
                            ShippingOrderStatus.CANCELLED, "SYSTEM");
                    log.info("Shipping cancelled: shippingId={}, borrowId={}", shipping.getId(), borrowId);
                }
            }
        }

        // Release hold and refund if deposit was confirmed
        if (borrow.getDepositStatus() == DepositStatus.CONFIRMED) {
            BigDecimal frozenAmount = borrow.getReplacementPriceSnapshot()
                    .add(borrow.getDepositAmount());
            walletService.releaseHold(borrow.getReaderId(), frozenAmount,
                    ReferenceType.BORROW, borrow.getId(),
                    "Hoàn tiền cọc - đơn mượn bị hủy");
            walletService.topUp(borrow.getReaderId(), borrow.getRentalFeeSnapshot(),
                    "Hoàn phí thuê - đơn mượn bị hủy");
            log.info("Wallet refunded for cancelled borrow: borrowId={}, depositAmount={}, rentalFee={}",
                    borrowId, borrow.getDepositAmount(), borrow.getRentalFeeSnapshot());
        }

        borrow.setStatus(BorrowStatus.CANCELLED);
        borrowRecordRepository.save(borrow);

        bookRepository.incrementStock(borrow.getBookId());
        log.info("Stock restored for bookId={} on cancel borrowId={}", borrow.getBookId(), borrowId);

        String readerMsg = isLibrarian
                ? "Đơn mượn của bạn đã bị hủy bởi nhân viên thư viện."
                : "Đơn mượn của bạn đã được hủy thành công.";
        String librarianMsg = isLibrarian
                ? "Bạn đã hủy đơn mượn sách thành công."
                : "Độc giả đã hủy đơn mượn sách.";
        UUID readerId = borrow.getReaderId();

        TransactionSynchronizationManager.registerSynchronization(
                new TransactionSynchronization() {
                    @Override
                    public void afterCommit() {
                        notificationService.notifyReader(readerId, readerMsg)
                                .exceptionally(ex -> {
                                    log.error("Failed to notify reader {}: {}", readerId, ex.getMessage());
                                    return null;
                                });
                        notificationService.notifyLibrarian(librarianMsg, borrowId)
                                .exceptionally(ex -> {
                                    log.error("Failed to notify librarian about borrow {}: {}", borrowId, ex.getMessage());
                                    return null;
                                });
                    }
                });

        log.info("Borrow cancelled: id={}, status={}, actorId={}, isLibrarian={}",
                borrow.getId(), borrow.getStatus(), actorId, isLibrarian);

        CancelBorrowResult.BorrowStatusInfo borrowInfo = CancelBorrowResult.BorrowStatusInfo.builder()
                .id(borrow.getId())
                .status(borrow.getStatus().name())
                .build();

        return CancelBorrowResult.builder()
                .message("Hủy đơn mượn thành công")
                .borrow(borrowInfo)
                .build();
    }
}
