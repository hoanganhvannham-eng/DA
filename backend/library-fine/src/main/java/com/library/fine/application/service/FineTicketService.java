package com.library.fine.application.service;

import com.library.fine.domain.entity.FineTicket;
import com.library.fine.domain.enums.FineStatus;
import com.library.fine.domain.enums.FineType;
import com.library.fine.domain.exception.FineNotPendingConfirmException;
import com.library.fine.domain.exception.FineTicketNotFoundException;
import com.library.fine.domain.exception.RejectionReasonRequiredException;
import com.library.fine.domain.exception.RejectionReasonTooLongException;
import com.library.fine.infrastructure.persistence.FineTicketRepository;
import com.library.fine.presentation.dto.FineTicketDetailDTO;
import com.library.fine.presentation.dto.response.ConfirmPaymentResponse;
import com.library.fine.presentation.dto.response.FineDetailResponse;
import com.library.fine.presentation.dto.response.PayFineFromWalletResponse;
import com.library.fine.presentation.dto.response.RejectPaymentResponse;
import com.library.wallet.application.service.WalletService;
import com.library.wallet.domain.enums.ReferenceType;
import com.library.wallet.domain.enums.TransactionType;
import com.library.wallet.domain.exception.InsufficientBalanceException;
import jakarta.persistence.Tuple;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class FineTicketService {

    private final FineTicketRepository fineTicketRepository;
    private final WalletService walletService;

    @Transactional(readOnly = true)
    public Page<FineTicketDetailDTO> getPendingConfirmFines(Pageable pageable) {
        Page<Tuple> page = fineTicketRepository.findPendingConfirmFines(pageable);
        List<FineTicketDetailDTO> dtos = page.getContent().stream().map(this::mapToTuple).toList();
        return new PageImpl<>(dtos, pageable, page.getTotalElements());
    }

    @Transactional(readOnly = true)
    public FineDetailResponse getFineDetail(UUID fineId) {
        Tuple row = fineTicketRepository.findDetailById(fineId)
                .orElseThrow(FineTicketNotFoundException::new);
        return FineDetailResponse.builder().fine(mapToTuple(row)).build();
    }

    @Transactional
    public ConfirmPaymentResponse confirmPayment(UUID fineId, UUID librarianId) {
        FineTicket ticket = fineTicketRepository.findById(fineId)
                .orElseThrow(FineTicketNotFoundException::new);

        if (ticket.getStatus() == FineStatus.PAID) {
            log.info("Fine payment already confirmed: fineId={}", fineId);
            return ConfirmPaymentResponse.builder()
                    .message("Xác nhận thanh toán thành công")
                    .fine(ConfirmPaymentResponse.FineInfo.builder()
                            .id(ticket.getId())
                            .status(ticket.getStatus().name())
                            .confirmedAt(ticket.getConfirmedAt())
                            .confirmedBy(ticket.getConfirmedBy())
                            .build())
                    .build();
        }

        if (ticket.getStatus() != FineStatus.PENDING_CONFIRM) {
            throw new FineNotPendingConfirmException();
        }

        ticket.setStatus(FineStatus.PAID);
        ticket.setConfirmedBy(librarianId);
        ticket.setConfirmedAt(Instant.now());
        fineTicketRepository.save(ticket);

        log.info("Fine payment confirmed: fineId={}, librarianId={}", fineId, librarianId);

        return ConfirmPaymentResponse.builder()
                .message("Xác nhận thanh toán thành công")
                .fine(ConfirmPaymentResponse.FineInfo.builder()
                        .id(ticket.getId())
                        .status(ticket.getStatus().name())
                        .confirmedAt(ticket.getConfirmedAt())
                        .confirmedBy(ticket.getConfirmedBy())
                        .build())
                .build();
    }

    @Transactional
    public RejectPaymentResponse rejectPayment(UUID fineId, String rejectionReason, UUID librarianId) {
        if (rejectionReason == null || rejectionReason.trim().isEmpty()) {
            throw new RejectionReasonRequiredException();
        }
        if (rejectionReason.length() > 500) {
            throw new RejectionReasonTooLongException();
        }

        FineTicket ticket = fineTicketRepository.findById(fineId)
                .orElseThrow(FineTicketNotFoundException::new);

        if (ticket.getStatus() == FineStatus.REJECTED) {
            log.info("Fine payment already rejected: fineId={}", fineId);
            return RejectPaymentResponse.builder()
                    .message("Từ chối thanh toán thành công")
                    .fine(RejectPaymentResponse.FineInfo.builder()
                            .id(ticket.getId())
                            .status(ticket.getStatus().name())
                            .rejectionReason(ticket.getRejectionReason())
                            .confirmedAt(ticket.getConfirmedAt())
                            .confirmedBy(ticket.getConfirmedBy())
                            .build())
                    .build();
        }

        if (ticket.getStatus() != FineStatus.PENDING_CONFIRM) {
            throw new FineNotPendingConfirmException();
        }

        ticket.setStatus(FineStatus.REJECTED);
        ticket.setRejectionReason(rejectionReason.trim());
        ticket.setConfirmedBy(librarianId);
        ticket.setConfirmedAt(Instant.now());
        fineTicketRepository.save(ticket);

        log.info("Fine payment rejected: fineId={}, librarianId={}", fineId, librarianId);

        return RejectPaymentResponse.builder()
                .message("Từ chối thanh toán thành công")
                .fine(RejectPaymentResponse.FineInfo.builder()
                        .id(ticket.getId())
                        .status(ticket.getStatus().name())
                        .rejectionReason(ticket.getRejectionReason())
                        .confirmedAt(ticket.getConfirmedAt())
                        .confirmedBy(ticket.getConfirmedBy())
                        .build())
                .build();
    }

    @Transactional
    public PayFineFromWalletResponse payFineFromWallet(UUID fineId, UUID userId) {
        FineTicket ticket = fineTicketRepository.findById(fineId)
                .orElseThrow(FineTicketNotFoundException::new);

        if (ticket.getStatus() == FineStatus.PAID) {
            return PayFineFromWalletResponse.builder()
                    .message("Phiếu phạt đã được thanh toán")
                    .fineId(ticket.getId())
                    .paidAmount(BigDecimal.ZERO)
                    .remainingAmount(ticket.getRemainingAmount() != null ? ticket.getRemainingAmount() : ticket.getAmount())
                    .status(ticket.getStatus().name())
                    .build();
        }

        if (ticket.getStatus() != FineStatus.UNPAID && ticket.getStatus() != FineStatus.PARTIALLY_PAID) {
            throw new FineNotPendingConfirmException();
        }

        BigDecimal remainingToPay = ticket.getRemainingAmount() != null
                ? ticket.getRemainingAmount()
                : ticket.getAmount();

        BigDecimal availableBalance = walletService.getAvailableBalance(userId);

        if (availableBalance.compareTo(BigDecimal.ZERO) <= 0) {
            throw new InsufficientBalanceException("Số dư ví không đủ để thanh toán phạt");
        }

        BigDecimal paidAmount;
        if (availableBalance.compareTo(remainingToPay) >= 0) {
            paidAmount = remainingToPay;
            ticket.setRemainingAmount(BigDecimal.ZERO);
            ticket.setStatus(FineStatus.PAID);
        } else {
            paidAmount = availableBalance;
            ticket.setRemainingAmount(remainingToPay.subtract(availableBalance));
            ticket.setStatus(FineStatus.PARTIALLY_PAID);
        }

        walletService.deduct(userId, paidAmount, TransactionType.FINE,
                ReferenceType.FINE, ticket.getId(), "Thanh toán phạt từ ví");

        fineTicketRepository.save(ticket);

        log.info("Fine paid from wallet: fineId={}, userId={}, paidAmount={}, remaining={}",
                fineId, userId, paidAmount, ticket.getRemainingAmount());

        return PayFineFromWalletResponse.builder()
                .message("Thanh toán phạt thành công")
                .fineId(ticket.getId())
                .paidAmount(paidAmount)
                .remainingAmount(ticket.getRemainingAmount() != null ? ticket.getRemainingAmount() : BigDecimal.ZERO)
                .status(ticket.getStatus().name())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean isBorrowingBlocked(UUID readerId) {
        long count = fineTicketRepository.countByReaderIdAndStatusIn(readerId,
                List.of(FineStatus.UNPAID, FineStatus.PARTIALLY_PAID));
        return count > 0;
    }

    @Transactional
    public FineTicket createFineTicket(UUID readerId, UUID borrowRecordId, BigDecimal amount,
                                        FineType fineType, UUID fineLevelId) {
        FineTicket ticket = FineTicket.builder()
                .readerId(readerId)
                .borrowRecordId(borrowRecordId)
                .amount(amount)
                .remainingAmount(amount)
                .fineType(fineType)
                .fineLevelId(fineLevelId)
                .status(FineStatus.UNPAID)
                .build();
        FineTicket saved = fineTicketRepository.save(ticket);
        log.info("FineTicket created: id={}, readerId={}, amount={}, type={}",
                saved.getId(), readerId, amount, fineType);
        return saved;
    }

    private FineTicketDetailDTO mapToTuple(Tuple row) {
        return FineTicketDetailDTO.builder()
                .id(toUUID(row.get("id")))
                .cause(determineCause(row.get("fine_type", String.class)))
                .amount(row.get("amount", java.math.BigDecimal.class))
                .remainingAmount(row.get("remaining_amount", java.math.BigDecimal.class))
                .status(row.get("status", String.class))
                .paymentProofUrl(row.get("payment_proof_url", String.class))
                .rejectionReason(row.get("rejection_reason", String.class))
                .voidReason(row.get("void_reason", String.class))
                .fineType(row.get("fine_type", String.class))
                .note(row.get("note", String.class))
                .confirmedBy(toUUID(row.get("confirmed_by")))
                .confirmedAt(toInstant(row.get("confirmed_at")))
                .proofSubmittedAt(toInstant(row.get("proof_submitted_at")))
                .createdAt(toInstant(row.get("created_at")))
                .updatedAt(toInstant(row.get("updated_at")))
                .bookTitle(row.get("book_title", String.class))
                .bookId(toUUID(row.get("book_id")))
                .readerName(row.get("reader_name", String.class))
                .build();
    }

    private String determineCause(String fineType) {
        if (fineType == null) return null;
        return switch (fineType) {
            case "OVERDUE" -> "Phạt trả muộn";
            case "DAMAGED" -> "Phạt hư hỏng sách";
            case "LOST" -> "Phạt mất sách";
            default -> null;
        };
    }

    private UUID toUUID(Object val) {
        if (val instanceof byte[] bytes && bytes.length == 16) {
            long msb = 0, lsb = 0;
            for (int i = 0; i < 8; i++) msb = (msb << 8) | (bytes[i] & 0xff);
            for (int i = 8; i < 16; i++) lsb = (lsb << 8) | (bytes[i] & 0xff);
            return new UUID(msb, lsb);
        }
        return null;
    }

    private Instant toInstant(Object val) {
        if (val instanceof java.sql.Timestamp ts) {
            return ts.toInstant();
        }
        if (val instanceof java.time.LocalDateTime ldt) {
            return ldt.atZone(java.time.ZoneOffset.UTC).toInstant();
        }
        return null;
    }
}
