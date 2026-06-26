package com.library.bookreturn.application.service;

import com.library.bookreturn.application.mapper.ReturnMapper;
import com.library.bookreturn.domain.enums.BookCondition;
import com.library.bookreturn.domain.enums.ReturnMethod;
import com.library.bookreturn.domain.event.ReturnCreatedEvent;
import com.library.bookreturn.domain.exception.ReturnBorrowNotFoundException;
import com.library.bookreturn.domain.exception.ReturnBulkConfirmInvalidConditionException;
import com.library.bookreturn.domain.exception.ReturnConfirmConditionRequiredException;
import com.library.bookreturn.domain.exception.ReturnConfirmFineLevelRequiredException;
import com.library.bookreturn.domain.exception.ReturnConfirmNoteRequiredException;
import com.library.bookreturn.domain.exception.ReturnDuplicateRequestException;
import com.library.bookreturn.domain.exception.ReturnShippingAttemptLimitExceededException;
import com.library.bookreturn.domain.exception.ReturnShippingLostResolutionRequiredException;
import com.library.bookreturn.domain.exception.ReturnShippingNotAllowedException;
import com.library.bookreturn.domain.exception.ReturnStatusInvalidException;
import com.library.bookreturn.presentation.dto.request.BulkConfirmReturnRequest;
import com.library.bookreturn.presentation.dto.request.ConfirmReturnRequest;
import com.library.bookreturn.presentation.dto.request.CreateReturnRequest;
import com.library.bookreturn.presentation.dto.request.ResolveReturnLostRequest;
import com.library.bookreturn.presentation.dto.response.BulkConfirmReturnResponse;
import com.library.bookreturn.presentation.dto.response.ConfirmReturnResponse;
import com.library.bookreturn.presentation.dto.response.CreateReturnResponse;
import com.library.bookreturn.presentation.dto.response.CreateReturnShipmentResponse;
import com.library.bookreturn.presentation.dto.response.PendingReturnDTO;
import com.library.bookreturn.presentation.dto.response.ResolveReturnLostResponse;
import com.library.bookreturn.presentation.dto.response.ReturnShippingIssueDTO;
import com.library.bookreturn.presentation.dto.response.ReturnShippingRequestedDTO;
import com.library.bookreturn.domain.port.BookReturnNotification;
import com.library.bookreturn.domain.port.NotificationService;
import com.library.book.domain.entity.Book;
import com.library.book.infrastructure.persistence.BookRepository;
import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.fine.domain.entity.FineTicket;
import com.library.fine.domain.enums.FineStatus;
import com.library.fine.domain.enums.FineType;
import com.library.fine.infrastructure.persistence.FineLevelRepository;
import com.library.fine.infrastructure.persistence.FineTicketRepository;
import com.library.shipping.application.config.ShippingProperties;
import com.library.shipping.application.service.ShippingStatusLogService;
import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.domain.port.MockShippingProvider;
import com.library.shipping.domain.port.ShippingOrderRepository;
import com.library.wallet.application.service.WalletService;
import com.library.wallet.domain.entity.Wallet;
import com.library.wallet.domain.enums.ReferenceType;
import com.library.wallet.domain.enums.TransactionType;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
public class ReturnService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final FineTicketRepository fineTicketRepository;
    private final FineLevelRepository fineLevelRepository;
    private final ReturnMapper returnMapper;
    private final ApplicationEventPublisher eventPublisher;
    private final ShippingOrderRepository shippingOrderRepository;
    private final MockShippingProvider mockShippingProvider;
    private final ShippingStatusLogService shippingStatusLogService;
    private final NotificationService notificationService;
    private final ShippingProperties shippingProperties;
    private final WalletService walletService;

    public ReturnService(
            BorrowRecordRepository borrowRecordRepository,
            BookRepository bookRepository,
            FineTicketRepository fineTicketRepository,
            FineLevelRepository fineLevelRepository,
            ReturnMapper returnMapper,
            ApplicationEventPublisher eventPublisher,
            ShippingOrderRepository shippingOrderRepository,
            MockShippingProvider mockShippingProvider,
            ShippingStatusLogService shippingStatusLogService,
            @BookReturnNotification NotificationService notificationService,
            ShippingProperties shippingProperties,
            WalletService walletService) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.fineTicketRepository = fineTicketRepository;
        this.fineLevelRepository = fineLevelRepository;
        this.returnMapper = returnMapper;
        this.eventPublisher = eventPublisher;
        this.shippingOrderRepository = shippingOrderRepository;
        this.mockShippingProvider = mockShippingProvider;
        this.shippingStatusLogService = shippingStatusLogService;
        this.notificationService = notificationService;
        this.shippingProperties = shippingProperties;
        this.walletService = walletService;
    }

    private static final List<BorrowStatus> ALLOWED_RETURN_STATUSES = List.of(BorrowStatus.BORROWING, BorrowStatus.OVERDUE);
    private static final List<BorrowStatus> DUPLICATE_RETURN_STATUSES = List.of(BorrowStatus.RETURN_PENDING, BorrowStatus.RETURN_REQUESTED);
    private static final List<BorrowStatus> PENDING_CONFIRM_STATUSES = List.of(BorrowStatus.RETURN_PENDING, BorrowStatus.RETURN_RECEIVED);

    @Transactional
    public CreateReturnResponse createReturnRequest(UUID requesterId, CreateReturnRequest request) {
        BorrowRecord record = borrowRecordRepository.findByIdWithLock(request.getBorrowRecordId())
                .orElseThrow(() -> {
                    log.warn("Create return failed: borrow not found id={}, requesterId={}", request.getBorrowRecordId(), requesterId);
                    return new ReturnBorrowNotFoundException();
                });

        boolean isLibrarianOrAdmin = request.isStaffOverride();
        if (!isLibrarianOrAdmin && !record.getReaderId().equals(requesterId)) {
            log.warn("Create return failed: borrow id={} not owned by readerId={}", request.getBorrowRecordId(), requesterId);
            throw new ReturnBorrowNotFoundException();
        }

        if (DUPLICATE_RETURN_STATUSES.contains(record.getStatus())) {
            log.warn("Create return failed: duplicate return request, borrow id={} status={}", request.getBorrowRecordId(), record.getStatus());
            throw new ReturnDuplicateRequestException();
        }

        if (!ALLOWED_RETURN_STATUSES.contains(record.getStatus())) {
            log.warn("Create return failed: invalid status {} for borrow id={}", record.getStatus(), request.getBorrowRecordId());
            throw new ReturnStatusInvalidException();
        }

        ReturnMethod returnMethod = request.getReturnMethod();
        String message;

        if (returnMethod == ReturnMethod.SHIPPING) {
            if (record.getFulfillmentMethod() != FulfillmentMethod.DELIVERY) {
                log.warn("Create return failed: borrow id={} fulfillment_method={} not DELIVERY for SHIPPING return",
                        request.getBorrowRecordId(), record.getFulfillmentMethod());
                throw new ReturnShippingNotAllowedException();
            }

            record.setStatus(BorrowStatus.RETURN_REQUESTED);
            record.setReturnMethod(ReturnMethod.SHIPPING.name());
            record.setPickupAddress(request.getPickupAddress().trim());
            message = "Yêu cầu trả sách qua shipping thành công";
        } else {
            record.setStatus(BorrowStatus.RETURN_PENDING);
            record.setReturnMethod(ReturnMethod.AT_LIBRARY.name());
            record.setPickupAddress(null);
            message = "Tạo yêu cầu trả sách thành công. Vui lòng mang sách đến thư viện";
        }

        UUID actualReaderId = record.getReaderId();
        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Return request created ({}): id={}, readerId={},",
                returnMethod, saved.getId(), actualReaderId, saved.getBookId());

        eventPublisher.publishEvent(new ReturnCreatedEvent(
                saved.getId(), actualReaderId, saved.getBookId(), returnMethod));
        return returnMapper.toCreateResponse(saved, message);
    }

    @Transactional(readOnly = true)
    public Page<PendingReturnDTO> getPendingReturns(int page, int size, String search, String statusFilter, String returnMethod) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "updatedAt"));

        List<BorrowStatus> statuses;
        if (statusFilter != null && !statusFilter.isBlank()) {
            statuses = List.of(BorrowStatus.valueOf(statusFilter));
        } else {
            statuses = PENDING_CONFIRM_STATUSES;
        }

        boolean hasMethodFilter = returnMethod != null && !returnMethod.isBlank();
        boolean hasSearch = search != null && !search.isBlank();

        Page<BorrowRecord> recordPage;

        if (hasSearch) {
            List<Book> books = bookRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(search);
            List<UUID> bookIds = books.stream().map(Book::getId).toList();
            if (bookIds.isEmpty()) {
                return Page.empty(pageable);
            }
            if (hasMethodFilter) {
                recordPage = borrowRecordRepository.findByStatusInAndReturnMethodAndBookIdIn(statuses, returnMethod, bookIds, pageable);
            } else {
                recordPage = borrowRecordRepository.findByStatusInAndBookIdIn(statuses, bookIds, pageable);
            }
        } else if (hasMethodFilter) {
            recordPage = borrowRecordRepository.findByStatusInAndReturnMethod(statuses, returnMethod, pageable);
        } else {
            recordPage = borrowRecordRepository.findByStatusIn(statuses, pageable);
        }

        return recordPage.map(record -> {
            Book book = bookRepository.findById(record.getBookId()).orElse(null);
            String bookTitle = book != null ? book.getTitle() : "Unknown";
            String readerName = resolveReaderName(record.getReaderId());
            return returnMapper.toPendingReturnDTO(record, readerName, bookTitle);
        });
    }

    @Transactional
    public ConfirmReturnResponse confirmReturn(UUID borrowId, ConfirmReturnRequest request, UUID librarianId) {
        BookCondition condition = request.getBookCondition();
        if (condition == null) {
            throw new ReturnConfirmConditionRequiredException();
        }

        if (condition != BookCondition.NORMAL) {
            if (request.getNote() == null || request.getNote().isBlank()) {
                throw new ReturnConfirmNoteRequiredException();
            }
            if (request.getNote().length() > 500) {
                throw new ReturnConfirmNoteRequiredException();
            }
        }

        if (condition == BookCondition.DAMAGED) {
            if (request.getFineLevelId() == null) {
                throw new ReturnConfirmFineLevelRequiredException();
            }
            fineLevelRepository.findById(request.getFineLevelId())
                    .orElseThrow(() -> {
                        log.warn("Confirm return failed: fineLevelId={} not found", request.getFineLevelId());
                        return new IllegalArgumentException("Mức phạt không tồn tại");
                    });
        }

        if (condition == BookCondition.LATE_RETURN) {
            if (request.getFineLevelId() == null) {
                throw new ReturnConfirmFineLevelRequiredException();
            }
            fineLevelRepository.findById(request.getFineLevelId())
                    .orElseThrow(() -> {
                        log.warn("Confirm return failed: fineLevelId={} not found", request.getFineLevelId());
                        return new IllegalArgumentException("Mức phạt không tồn tại");
                    });
        }

        BorrowRecord record = borrowRecordRepository.findByIdWithLock(borrowId)
                .orElseThrow(() -> {
                    log.warn("Confirm return failed: borrow not found id={}", borrowId);
                    return new ReturnBorrowNotFoundException();
                });

        if (!PENDING_CONFIRM_STATUSES.contains(record.getStatus())) {
            log.warn("Confirm return failed: invalid status {} for borrow id={}", record.getStatus(), borrowId);
            throw new ReturnStatusInvalidException();
        }

        Book book = bookRepository.findById(record.getBookId())
                .orElseThrow(() -> {
                    log.warn("Confirm return failed: book not found id={}", record.getBookId());
                    return new ReturnBorrowNotFoundException();
                });

        List<FineTicket> finesCreated = new ArrayList<>();
        BigDecimal releaseAmount = BigDecimal.ZERO;

        switch (condition) {
            case NORMAL -> {
                bookRepository.updateForNormalReturn(book.getId());
                log.info("Confirm return NORMAL: bookId={}, borrowId={}", book.getId(), borrowId);

                if (record.getDepositAmount() != null && record.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                        && record.getDepositStatus() != null
                        && record.getDepositStatus() == DepositStatus.CONFIRMED) {
                    BigDecimal frozenAmount = record.getReplacementPriceSnapshot()
                            .add(record.getDepositAmount());
                    releaseAmount = frozenAmount;
                    walletService.releaseHold(record.getReaderId(), releaseAmount,
                            ReferenceType.BORROW, borrowId, "Hoàn cọc sách trả đúng hạn");
                    log.info("Return NORMAL: released hold userId={}, amount={}, borrowId={}",
                            record.getReaderId(), releaseAmount, borrowId);

                    if ("CASH".equals(request.getRefundMethod())) {
                        walletService.withdraw(record.getReaderId(), releaseAmount, "Hoàn cọc tiền mặt");
                        log.info("Return NORMAL: cash refund userId={}, amount={}, borrowId={}",
                                record.getReaderId(), releaseAmount, borrowId);
                    }
                }
                record.setDepositStatus(DepositStatus.REFUNDED);
            }
            case DAMAGED -> {
                BigDecimal totalFine = BigDecimal.ZERO;
                FineTicket overdueFine = null;

                if (record.getDueDate() != null && record.getDueDate().isBefore(Instant.now())) {
                    overdueFine = createFineTicket(
                            record, FineType.OVERDUE, request.getFineLevelId(), request.getNote());
                    finesCreated.add(overdueFine);
                    totalFine = totalFine.add(overdueFine.getAmount());
                    log.info("Confirm return DAMAGED: created OVERDUE fine for borrowId={}", borrowId);
                }

                FineTicket damagedFine = createFineTicket(
                        record, FineType.DAMAGED, request.getFineLevelId(), request.getNote());
                finesCreated.add(damagedFine);
                totalFine = totalFine.add(damagedFine.getAmount());

                bookRepository.updateForDamagedReturn(book.getId());
                log.info("Confirm return DAMAGED: bookId={}, borrowId={}, totalFine={}", book.getId(), borrowId, totalFine);

                if (record.getDepositAmount() != null && record.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                        && record.getDepositStatus() != null
                        && record.getDepositStatus() == DepositStatus.CONFIRMED) {
                    Wallet wallet = walletService.findByUserIdWithLock(record.getReaderId());
                    BigDecimal originalHeld = wallet.getHeldAmount();

                    if (originalHeld.compareTo(totalFine) >= 0) {
                        walletService.deductHeld(record.getReaderId(), totalFine,
                                TransactionType.DEPOSIT_CONVERTED, ReferenceType.BORROW, borrowId,
                                "Trừ cọc trả sách hư hỏng");
                        releaseAmount = originalHeld.subtract(totalFine);
                        if (releaseAmount.compareTo(BigDecimal.ZERO) > 0) {
                            walletService.releaseHold(record.getReaderId(), releaseAmount,
                                    ReferenceType.BORROW, borrowId, "Hoàn phần cọc dư");
                        }
                        log.info("Return DAMAGED: deducted from held={}, releaseRemaining={}, borrowId={}",
                                totalFine, releaseAmount, borrowId);
                    } else {
                        walletService.deductHeld(record.getReaderId(), originalHeld,
                                TransactionType.DEPOSIT_CONVERTED, ReferenceType.BORROW, borrowId,
                                "Trừ hết cọc trả sách hư hỏng");
                        BigDecimal remaining = totalFine.subtract(originalHeld);
                        BigDecimal currentAvailable = walletService.getAvailableBalance(record.getReaderId());

                        if (currentAvailable.compareTo(remaining) >= 0) {
                            walletService.deduct(record.getReaderId(), remaining,
                                    TransactionType.FINE, ReferenceType.BORROW, borrowId,
                                    "Trừ tiền phạt trả sách hư hỏng");
                        } else {
                            if (currentAvailable.compareTo(BigDecimal.ZERO) > 0) {
                                walletService.deduct(record.getReaderId(), currentAvailable,
                                        TransactionType.FINE, ReferenceType.BORROW, borrowId,
                                        "Trừ hết tiền phạt trả sách hư hỏng");
                            }
                            BigDecimal shortfall = remaining.subtract(currentAvailable);
                            FineTicket shortfallFine = createFineTicketWithAmount(
                                    record, FineType.DAMAGED, shortfall, request.getNote());
                            finesCreated.add(shortfallFine);
                        }
                        log.info("Return DAMAGED: deducted all held={}, remaining={}, borrowId={}",
                                originalHeld, remaining, borrowId);
                    }

                    if ("CASH".equals(request.getRefundMethod()) && releaseAmount.compareTo(BigDecimal.ZERO) > 0) {
                        walletService.withdraw(record.getReaderId(), releaseAmount, "Hoàn cọc tiền mặt");
                        log.info("Return DAMAGED: cash refund userId={}, amount={}, borrowId={}",
                                record.getReaderId(), releaseAmount, borrowId);
                    }

                    // Đã trừ wallet thành công → mark các FineTicket đã tự động thu là PAID
                    if (overdueFine != null) {
                        overdueFine.setStatus(FineStatus.PAID);
                        fineTicketRepository.save(overdueFine);
                    }
                    damagedFine.setStatus(FineStatus.PAID);
                    fineTicketRepository.save(damagedFine);
                }
                record.setDepositStatus(DepositStatus.CONFIRMED);
            }
            case LOST -> {
                int voided = fineTicketRepository.voidOverdueFinesByBorrowRecordId(
                        borrowId, "SUPERSEDED_BY_LOST");
                if (voided > 0) {
                    log.info("Confirm return LOST: voided {} OVERDUE UNPAID fines for borrowId={}", voided, borrowId);
                }

                if (record.getDepositAmount() != null && record.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                        && record.getDepositStatus() != null
                        && record.getDepositStatus() == DepositStatus.CONFIRMED) {
                    Wallet wallet = walletService.findByUserIdWithLock(record.getReaderId());
                    BigDecimal convertDeposit = wallet.getHeldAmount();

                    if (convertDeposit.compareTo(BigDecimal.ZERO) > 0) {
                        walletService.deductHeld(record.getReaderId(), convertDeposit,
                                TransactionType.DEPOSIT_CONVERTED, ReferenceType.BORROW, borrowId,
                                "Convert cọc đền bù mất sách");
                        log.info("Return LOST: converted held={}, borrowId={}", convertDeposit, borrowId);
                    }

                    if (record.getReplacementPriceSnapshot() != null
                            && record.getReplacementPriceSnapshot().compareTo(convertDeposit) > 0) {
                        BigDecimal fineAmount = record.getReplacementPriceSnapshot().subtract(convertDeposit);
                        FineTicket lostFine = createFineTicketWithAmount(
                                record, FineType.LOST, fineAmount, request.getNote());
                        finesCreated.add(lostFine);
                        log.info("Return LOST: created LOST fine={}, borrowId={}", fineAmount, borrowId);
                    }
                } else {
                    if (record.getReplacementPriceSnapshot() != null
                            && record.getReplacementPriceSnapshot().compareTo(BigDecimal.ZERO) > 0) {
                        FineTicket lostFine = createFineTicketWithAmount(
                                record, FineType.LOST, record.getReplacementPriceSnapshot(), request.getNote());
                        finesCreated.add(lostFine);
                        log.info("Return LOST: created LOST fine (no deposit)={}, borrowId={}",
                                record.getReplacementPriceSnapshot(), borrowId);
                    }
                }

                bookRepository.updateForLostReturn(book.getId());
                log.info("Confirm return LOST: bookId={}, borrowId={}", book.getId(), borrowId);
                record.setDepositStatus(DepositStatus.CONFIRMED);
            }
            case LATE_RETURN -> {
                if (record.getDueDate() == null || !record.getDueDate().isBefore(Instant.now())) {
                    log.warn("Confirm return LATE_RETURN: book is not overdue for borrowId={}", borrowId);
                    throw new IllegalArgumentException("Sách chưa quá hạn trả");
                }

                long overdueDays = java.time.temporal.ChronoUnit.DAYS.between(record.getDueDate(), Instant.now());
                if (overdueDays < 1) overdueDays = 1;

                com.library.fine.domain.entity.FineLevel fineLevel = fineLevelRepository.findById(request.getFineLevelId())
                        .orElseThrow(() -> {
                            log.warn("Confirm return LATE_RETURN: fineLevelId={} not found", request.getFineLevelId());
                            return new IllegalArgumentException("Mức phạt không tồn tại");
                        });

                BigDecimal fineAmount = fineLevel.getAmountPerDay().multiply(BigDecimal.valueOf(overdueDays));
                if (fineLevel.getMaxAmount() != null && fineAmount.compareTo(fineLevel.getMaxAmount()) > 0) {
                    fineAmount = fineLevel.getMaxAmount();
                }

                FineTicket overdueFine = createFineTicketWithAmount(
                        record, FineType.OVERDUE, fineAmount, request.getNote());
                finesCreated.add(overdueFine);
                log.info("Confirm return LATE_RETURN: days={}, amountPerDay={}, totalFine={}, borrowId={}",
                        overdueDays, fineLevel.getAmountPerDay(), fineAmount, borrowId);

                bookRepository.updateForNormalReturn(book.getId());
                log.info("Confirm return LATE_RETURN: bookId={}, borrowId={}", book.getId(), borrowId);

                if (record.getDepositAmount() != null && record.getDepositAmount().compareTo(BigDecimal.ZERO) > 0
                        && record.getDepositStatus() != null
                        && record.getDepositStatus() == DepositStatus.CONFIRMED) {
                    Wallet wallet = walletService.findByUserIdWithLock(record.getReaderId());
                    BigDecimal originalHeld = wallet.getHeldAmount();

                    if (originalHeld.compareTo(fineAmount) >= 0) {
                        walletService.deductHeld(record.getReaderId(), fineAmount,
                                TransactionType.DEPOSIT_CONVERTED, ReferenceType.BORROW, borrowId,
                                "Trừ cọc trả sách muộn");
                        releaseAmount = originalHeld.subtract(fineAmount);
                        if (releaseAmount.compareTo(BigDecimal.ZERO) > 0) {
                            walletService.releaseHold(record.getReaderId(), releaseAmount,
                                    ReferenceType.BORROW, borrowId, "Hoàn phần cọc dư");
                        }
                        log.info("Return LATE_RETURN: deducted from held={}, releaseRemaining={}, borrowId={}",
                                fineAmount, releaseAmount, borrowId);
                    } else {
                        walletService.deductHeld(record.getReaderId(), originalHeld,
                                TransactionType.DEPOSIT_CONVERTED, ReferenceType.BORROW, borrowId,
                                "Trừ hết cọc trả sách muộn");
                        BigDecimal remaining = fineAmount.subtract(originalHeld);
                        BigDecimal currentAvailable = walletService.getAvailableBalance(record.getReaderId());

                        if (currentAvailable.compareTo(remaining) >= 0) {
                            walletService.deduct(record.getReaderId(), remaining,
                                    TransactionType.FINE, ReferenceType.BORROW, borrowId,
                                    "Trừ tiền phạt trả sách muộn");
                        } else {
                            if (currentAvailable.compareTo(BigDecimal.ZERO) > 0) {
                                walletService.deduct(record.getReaderId(), currentAvailable,
                                        TransactionType.FINE, ReferenceType.BORROW, borrowId,
                                        "Trừ hết tiền phạt trả sách muộn");
                            }
                            BigDecimal shortfall = remaining.subtract(currentAvailable);
                            FineTicket shortfallFine = createFineTicketWithAmount(
                                    record, FineType.OVERDUE, shortfall, request.getNote());
                            finesCreated.add(shortfallFine);
                        }
                        log.info("Return LATE_RETURN: deducted all held={}, remaining={}, borrowId={}",
                                originalHeld, remaining, borrowId);
                    }

                    if ("CASH".equals(request.getRefundMethod()) && releaseAmount.compareTo(BigDecimal.ZERO) > 0) {
                        walletService.withdraw(record.getReaderId(), releaseAmount, "Hoàn cọc tiền mặt");
                        log.info("Return LATE_RETURN: cash refund userId={}, amount={}, borrowId={}",
                                record.getReaderId(), releaseAmount, borrowId);
                    }

                    overdueFine.setStatus(FineStatus.PAID);
                    fineTicketRepository.save(overdueFine);
                }
                record.setDepositStatus(DepositStatus.CONFIRMED);
            }
        }

        record.setStatus(BorrowStatus.RETURNED);
        record.setReturnedAt(Instant.now());
        record.setBookCondition(condition.name());
        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(Instant.now());
        if (request.getRefundMethod() != null) {
            record.setRefundMethod(request.getRefundMethod());
        }

        borrowRecordRepository.save(record);
        log.info("Return confirmed: borrowId={}, condition={}, librarianId={}", borrowId, condition, librarianId);

        String message = finesCreated.isEmpty()
                ? "Xác nhận trả sách thành công"
                : "Xác nhận trả sách thành công - Đã tạo phiếu phạt";

        return returnMapper.toConfirmResponse(record, message, finesCreated);
    }

    @Transactional
    public BulkConfirmReturnResponse bulkConfirmReturn(BulkConfirmReturnRequest request, UUID librarianId) {
        String conditionStr = request.getBookCondition();
        if (conditionStr == null || conditionStr.isBlank()) {
            throw new ReturnConfirmConditionRequiredException();
        }

        BookCondition condition = BookCondition.valueOf(conditionStr);
        if (condition != BookCondition.NORMAL) {
            throw new ReturnBulkConfirmInvalidConditionException();
        }

        List<BulkConfirmReturnResponse.BulkConfirmResult> results = new ArrayList<>();
        int success = 0;
        int failed = 0;

        for (UUID borrowId : request.getBorrowIds()) {
            try {
                ConfirmReturnRequest confirmReq = new ConfirmReturnRequest();
                confirmReq.setBookCondition(condition);
                confirmReq.setRefundMethod(request.getRefundMethod());
                confirmReturn(borrowId, confirmReq, librarianId);
                success++;
                results.add(BulkConfirmReturnResponse.BulkConfirmResult.builder()
                        .borrowId(borrowId)
                        .success(true)
                        .message("Xác nhận trả sách thành công")
                        .build());
            } catch (Exception e) {
                failed++;
                log.warn("Bulk confirm failed for borrowId={}: {}", borrowId, e.getMessage());
                results.add(BulkConfirmReturnResponse.BulkConfirmResult.builder()
                        .borrowId(borrowId)
                        .success(false)
                        .message(e.getMessage() != null ? e.getMessage() : "Lỗi không xác định")
                        .build());
            }
        }

        String message = String.format("Xác nhận hàng loạt: %d/%d thành công", success, request.getBorrowIds().size());
        return BulkConfirmReturnResponse.builder()
                .message(message)
                .totalRequested(request.getBorrowIds().size())
                .totalSuccess(success)
                .totalFailed(failed)
                .results(results)
                .build();
    }

    private FineTicket createFineTicket(BorrowRecord record, FineType fineType, UUID fineLevelId, String note) {
        com.library.fine.domain.entity.FineLevel fineLevel = fineLevelRepository.findById(fineLevelId)
                .orElseThrow(() -> new IllegalArgumentException("Mức phạt không tồn tại"));

        FineTicket ticket = new FineTicket();
        ticket.setBorrowRecordId(record.getId());
        ticket.setReaderId(record.getReaderId());
        ticket.setFineType(fineType);
        ticket.setFineLevelId(fineLevel.getId());
        ticket.setAmount(fineLevel.getAmount());
        ticket.setStatus(FineStatus.UNPAID);
        ticket.setNote(note);

        FineTicket saved = fineTicketRepository.save(ticket);
        log.info("Fine ticket created: type={}, amount={}, borrowId={}", fineType, fineLevel.getAmount(), record.getId());
        return saved;
    }

    private FineTicket createFineTicketWithAmount(BorrowRecord record, FineType fineType, BigDecimal amount, String note) {
        FineTicket ticket = new FineTicket();
        ticket.setBorrowRecordId(record.getId());
        ticket.setReaderId(record.getReaderId());
        ticket.setFineType(fineType);
        ticket.setAmount(amount);
        ticket.setStatus(FineStatus.UNPAID);
        ticket.setNote(note);

        FineTicket saved = fineTicketRepository.save(ticket);
        log.info("Fine ticket created with amount: type={}, amount={}, borrowId={}", fineType, amount, record.getId());
        return saved;
    }

    private String resolveReaderName(UUID readerId) {
        return "Reader";
    }

    @Transactional(readOnly = true)
    public Page<ReturnShippingRequestedDTO> getReturnRequestedBorrows(int page, int size, String search) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "createdAt"));

        Page<BorrowRecord> recordPage;
        if (search != null && !search.isBlank()) {
            List<Book> books = bookRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(search);
            List<UUID> bookIds = books.stream().map(Book::getId).toList();
            if (bookIds.isEmpty()) {
                return Page.empty();
            }
            recordPage = borrowRecordRepository.findByStatusInAndBookIdIn(
                    List.of(BorrowStatus.RETURN_REQUESTED), bookIds, pageable);
        } else {
            recordPage = borrowRecordRepository.findByStatus(BorrowStatus.RETURN_REQUESTED, pageable);
        }

        return recordPage.map(record -> {
            Book book = bookRepository.findById(record.getBookId()).orElse(null);
            String bookTitle = book != null ? book.getTitle() : "Unknown";
            String readerName = resolveReaderName(record.getReaderId());
            return returnMapper.toReturnShippingRequestedDTO(record, readerName, bookTitle);
        });
    }

    @Transactional(readOnly = true)
    public Page<ReturnShippingIssueDTO> getReturnShippingIssues(int page, int size, String search, String statusFilter) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.ASC, "updatedAt"));

        List<BorrowStatus> issueStatuses;
        if (statusFilter != null && !statusFilter.isBlank()) {
            issueStatuses = List.of(BorrowStatus.valueOf(statusFilter));
        } else {
            issueStatuses = List.of(BorrowStatus.RETURN_SHIPPING_FAILED, BorrowStatus.RETURN_SHIPPING_LOST);
        }

        Page<BorrowRecord> recordPage;
        if (search != null && !search.isBlank()) {
            List<Book> books = bookRepository.findByTitleContainingIgnoreCaseAndIsDeletedFalse(search);
            List<UUID> bookIds = books.stream().map(Book::getId).toList();
            if (bookIds.isEmpty()) {
                return Page.empty(pageable);
            }
            recordPage = borrowRecordRepository.findByStatusInAndBookIdIn(issueStatuses, bookIds, pageable);
        } else {
            recordPage = borrowRecordRepository.findByStatusIn(issueStatuses, pageable);
        }

        return recordPage.map(record -> {
            Book book = bookRepository.findById(record.getBookId()).orElse(null);
            String bookTitle = book != null ? book.getTitle() : "Unknown";
            String readerName = resolveReaderName(record.getReaderId());
            return returnMapper.toReturnShippingIssueDTO(record, readerName, bookTitle);
        });
    }

    @Transactional
    public CreateReturnShipmentResponse createReturnShipment(UUID borrowId, UUID librarianId) {
        BorrowRecord borrow = borrowRecordRepository.findByIdWithLock(borrowId)
                .orElseThrow(() -> {
                    log.warn("Create return shipment failed: borrow not found id={}", borrowId);
                    return new ReturnBorrowNotFoundException();
                });

        if (borrow.getStatus() != BorrowStatus.RETURN_REQUESTED) {
            log.warn("Create return shipment failed: borrow id={} status={} is not RETURN_REQUESTED",
                    borrowId, borrow.getStatus());
            throw new ReturnStatusInvalidException();
        }

        int currentAttempts = borrow.getReturnAttemptCount() != null ? borrow.getReturnAttemptCount() : 0;
        int maxAttempts = shippingProperties.getMaxReturnAttempts();
        if (currentAttempts >= maxAttempts) {
            log.warn("Create return shipment failed: borrow id={} attempts={} >= {}", borrowId, currentAttempts, maxAttempts);
            throw new ReturnShippingAttemptLimitExceededException();
        }

        MockShippingProvider.ShipmentResult providerResult;
        try {
            providerResult = mockShippingProvider.createShipment(
                    ShippingType.RETURN, borrow.getPickupAddress(), shippingProperties.getDefaultCarrier());
        } catch (Exception e) {
            log.error("Mock shipping provider call failed for return shipment borrowId={}", borrowId, e);
            throw new RuntimeException("Dịch vụ vận chuyển không khả dụng", e);
        }

        int attemptNumber = currentAttempts + 1;

        ShippingOrder shippingOrder = new ShippingOrder();
        shippingOrder.setBorrowRecordId(borrowId);
        shippingOrder.setType(ShippingType.RETURN);
        shippingOrder.setStatus(ShippingOrderStatus.CREATED);
        shippingOrder.setTrackingNumber(providerResult.trackingNumber());
        shippingOrder.setShippingAddress(borrow.getPickupAddress());
        shippingOrder.setCarrier(shippingProperties.getDefaultCarrier());
        shippingOrder.setAttemptNumber(attemptNumber);
        shippingOrder.setEstimatedDeliveryDate(providerResult.estimatedDeliveryDate());
        shippingOrder.setCreatedBy(librarianId);
        shippingOrder = shippingOrderRepository.save(shippingOrder);

        shippingStatusLogService.logStatusChange(
                shippingOrder.getId(), null, ShippingOrderStatus.CREATED, "LIBRARIAN");

        borrow.setStatus(BorrowStatus.RETURN_IN_TRANSIT);
        borrow.setReturnAttemptCount(attemptNumber);
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Đơn lấy sách đã được tạo. Mã tracking: " + providerResult.trackingNumber());

        log.info("Return shipment created: borrowId={}, tracking={}, attempt={}, librarianId={}",
                borrowId, providerResult.trackingNumber(), attemptNumber, librarianId);

        return returnMapper.toCreateReturnShipmentResponse(shippingOrder, borrow);
    }

    @Transactional
    public void retryReturnShipping(UUID borrowId) {
        BorrowRecord borrow = borrowRecordRepository.findByIdWithLock(borrowId)
                .orElseThrow(() -> {
                    log.warn("Retry return shipping failed: borrow not found id={}", borrowId);
                    return new ReturnBorrowNotFoundException();
                });

        if (borrow.getStatus() != BorrowStatus.RETURN_SHIPPING_FAILED) {
            log.warn("Retry return shipping failed: borrow id={} status={} is not RETURN_SHIPPING_FAILED",
                    borrowId, borrow.getStatus());
            throw new ReturnStatusInvalidException();
        }

        int currentAttempts = borrow.getReturnAttemptCount() != null ? borrow.getReturnAttemptCount() : 0;
        int maxAttempts = shippingProperties.getMaxReturnAttempts();
        if (currentAttempts >= maxAttempts) {
            log.warn("Retry return shipping failed: borrow id={} attempts={} >= {}", borrowId, currentAttempts, maxAttempts);
            throw new ReturnShippingAttemptLimitExceededException();
        }

        borrow.setStatus(BorrowStatus.RETURN_REQUESTED);
        borrowRecordRepository.save(borrow);

        notificationService.notifyReader(borrow.getReaderId(),
                "Sách sẽ được gửi trả lại. Nhân viên thư viện sẽ tạo đơn vận chuyển mới.");

        log.info("Return shipping retry: borrowId={} reset to RETURN_REQUESTED", borrowId);
    }

    @Transactional
    public ResolveReturnLostResponse resolveReturnLost(UUID borrowId, ResolveReturnLostRequest request, UUID librarianId) {
        String resolution = request.getResolution();
        if (resolution == null || resolution.isBlank()) {
            throw new ReturnShippingLostResolutionRequiredException();
        }

        BorrowRecord record = borrowRecordRepository.findByIdWithLock(borrowId)
                .orElseThrow(() -> {
                    log.warn("Resolve return lost failed: borrow not found id={}", borrowId);
                    return new ReturnBorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.RETURN_SHIPPING_LOST) {
            log.warn("Resolve return lost failed: borrow id={} status={} is not RETURN_SHIPPING_LOST",
                    borrowId, record.getStatus());
            throw new ReturnStatusInvalidException();
        }

        List<FineTicket> finesCreated = new ArrayList<>();
        Book book = bookRepository.findById(record.getBookId())
                .orElseThrow(() -> {
                    log.warn("Resolve return lost failed: book not found id={}", record.getBookId());
                    return new ReturnBorrowNotFoundException();
                });

        if ("CARRIER_FAULT".equals(resolution)) {
            bookRepository.updateForLostReturn(book.getId());

            record.setStatus(BorrowStatus.RETURNED);
            record.setReturnedAt(Instant.now());
            record.setReturnLostResolution("CARRIER_FAULT");
            record.setInvestigationNote(request.getNote());
            record.setConfirmedBy(librarianId);
            record.setConfirmedAt(Instant.now());

            borrowRecordRepository.save(record);

            notificationService.notifyReader(record.getReaderId(),
                    "Đơn đã đóng. Không phạt (lỗi carrier).");

            log.info("Return lost resolved (CARRIER_FAULT): borrowId={}, librarianId={}", borrowId, librarianId);

            return returnMapper.toResolveReturnLostResponse(record, "Giải quyết mất hàng thành công - Không phạt", finesCreated);

        } else if ("READER_FAULT".equals(resolution)) {
            if (request.getFineLevelId() == null) {
                throw new ReturnConfirmFineLevelRequiredException();
            }
            if (request.getNote() == null || request.getNote().isBlank()) {
                throw new ReturnConfirmNoteRequiredException();
            }

            int voided = fineTicketRepository.voidOverdueFinesByBorrowRecordId(borrowId, "SUPERSEDED_BY_LOST");
            if (voided > 0) {
                log.info("Resolve return lost READER_FAULT: voided {} OVERDUE UNPAID fines for borrowId={}", voided, borrowId);
            }

            FineTicket lostFine = createFineTicket(record, FineType.LOST, request.getFineLevelId(), request.getNote());
            finesCreated.add(lostFine);

            bookRepository.updateForLostReturn(book.getId());

            record.setStatus(BorrowStatus.RETURNED);
            record.setReturnedAt(Instant.now());
            record.setReturnLostResolution("READER_FAULT");
            record.setInvestigationNote(request.getNote());
            record.setConfirmedBy(librarianId);
            record.setConfirmedAt(Instant.now());

            borrowRecordRepository.save(record);

            notificationService.notifyReader(record.getReaderId(),
                    "Đơn đã đóng. Tạo phiếu phạt mất sách.");

            log.info("Return lost resolved (READER_FAULT): borrowId={}, librarianId={}", borrowId, librarianId);

            return returnMapper.toResolveReturnLostResponse(record, "Giải quyết mất hàng thành công - Đã tạo phiếu phạt", finesCreated);

        } else {
            throw new ReturnShippingLostResolutionRequiredException();
        }
    }
}
