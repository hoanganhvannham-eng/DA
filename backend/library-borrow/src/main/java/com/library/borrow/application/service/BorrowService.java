package com.library.borrow.application.service;

import com.library.borrow.application.service.RiskAssessmentService.RiskAssessmentResult;
import com.library.borrow.domain.entity.BorrowRecord;
import com.library.book.domain.entity.DepositPolicy;
import com.library.borrow.domain.entity.RentalRate;
import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BookRepository.BookDepositInfo;
import com.library.borrow.domain.port.BorrowRecordRepository;
import com.library.borrow.domain.port.DepositPolicyRepository;
import com.library.borrow.domain.port.RentalRateRepository;
import com.library.borrow.domain.port.UserProfileRepository;
import com.library.borrow.application.mapper.BorrowMapper;
import com.library.borrow.domain.exception.BorrowNotFoundException;
import com.library.borrow.domain.exception.InvalidStatusTransitionException;
import com.library.borrow.domain.exception.MaxActiveBorrowsException;
import com.library.borrow.domain.exception.UnpaidFinesException;
import com.library.borrow.presentation.dto.request.CreateBorrowRequest;
import com.library.borrow.presentation.dto.response.BorrowRecordResponse;
import com.library.fine.application.service.FineTicketService;
import com.library.wallet.application.service.WalletService;
import com.library.wallet.domain.enums.ReferenceType;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.security.SecureRandom;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BorrowService {

    private static final int MAX_ACTIVE_BORROWS = 5;
    private static final int RESERVATION_HOURS = 48;
    private static final int PENDING_APPROVAL_HOURS = 24;

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserProfileRepository userProfileRepository;
    private final InventoryService inventoryService;
    private final RiskAssessmentService riskAssessmentService;
    private final BorrowMapper borrowMapper;
    private final WalletService walletService;
    private final FineTicketService fineTicketService;
    private final RentalRateRepository rentalRateRepository;
    private final DepositPolicyRepository depositPolicyRepository;

    @Transactional
    public BorrowRecordResponse createBorrowRequest(UUID readerId, CreateBorrowRequest request) {
        String traceId = MDC.get("traceId");

        bookRepository.findByIdNotDeleted(request.getBookId())
                .orElseThrow(() -> {
                    log.warn("Create borrow failed: book not found id={}", request.getBookId());
                    return new BorrowNotFoundException();
                });

        int activeBorrows = borrowRecordRepository.countActiveByReaderId(readerId);
        if (activeBorrows >= MAX_ACTIVE_BORROWS) {
            log.warn("Create borrow failed: readerId={} has {} active borrows (max {})", readerId, activeBorrows, MAX_ACTIVE_BORROWS);
            throw new MaxActiveBorrowsException();
        }

        if (fineTicketService.isBorrowingBlocked(readerId)) {
            log.warn("Create borrow failed: readerId={} has unpaid fines (blocked)", readerId);
            throw new UnpaidFinesException();
        }

        if (request.getFulfillmentMethod() == FulfillmentMethod.DELIVERY
                && (request.getShippingAddress() == null || request.getShippingAddress().isBlank())) {
            String address = userProfileRepository.getAddressByUserId(readerId);
            if (address != null && !address.isBlank()) {
                request.setShippingAddress(address);
                log.info("Auto-filled shipping address for readerId={}: {}", readerId, address);
            }
        }

        boolean wasLastCopy = inventoryService.softLockStock(request.getBookId());

        RiskAssessmentResult riskResult = riskAssessmentService.assessRisk(readerId, request.getBookId(), wasLastCopy);

        // --- Deposit logic ---
        RentalRate rentalRate = rentalRateRepository.findByDurationDays(request.getDurationDays())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy bảng giá cho " + request.getDurationDays() + " ngày"));

        BookDepositInfo bookDepositInfo = bookRepository.findDepositInfoByBookId(request.getBookId())
                .orElseThrow(() -> new IllegalArgumentException("Sách không tồn tại"));

        Integer effectiveDepositRate = bookDepositInfo.customDepositRate() != null
                ? bookDepositInfo.customDepositRate().intValue()
                : resolveDepositRate(bookDepositInfo.depositPolicyId());

        BigDecimal replacementPrice = bookDepositInfo.replacementPrice() != null
                ? bookDepositInfo.replacementPrice()
                : BigDecimal.ZERO;

        BigDecimal depositAmount = replacementPrice
                .multiply(BigDecimal.valueOf(effectiveDepositRate))
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        BigDecimal rentalFee = rentalRate.getFee();

        BigDecimal frozenAmount = replacementPrice.add(depositAmount);
        BigDecimal requiredBalance = frozenAmount.add(rentalFee);

        // --- Build record ---
        BorrowRecord record = new BorrowRecord();
        record.setReaderId(readerId);
        record.setBookId(request.getBookId());
        record.setDurationDays(request.getDurationDays());
        record.setFulfillmentMethod(request.getFulfillmentMethod());
        record.setShippingAddress(request.getShippingAddress());
        record.setRentalRateId(rentalRate.getId());
        record.setRentalFeeSnapshot(rentalFee);
        record.setReplacementPriceSnapshot(replacementPrice);
        record.setDepositRateSnapshot(effectiveDepositRate);
        record.setDepositAmount(depositAmount);
        record.setDepositStatus(DepositStatus.PENDING);

        if (riskResult.allPassed()) {
            // No risk → auto deduct rental fee + hold deposit + generate pickup code
            walletService.findByUserIdWithLock(readerId);
            boolean walletOk = walletService.checkSufficientAvailable(readerId, requiredBalance);
            if (!walletOk) {
                record.setStatus(BorrowStatus.CANCELLED);
                inventoryService.restoreStock(record.getBookId());
                log.warn("Create borrow cancelled: readerId={} insufficient wallet balance, need={}", readerId, requiredBalance);
                BorrowRecord saved = borrowRecordRepository.save(record);
                BorrowRecordResponse response = borrowMapper.toResponse(saved);
                enrichWithNames(response, saved);
                response.setMessage("Tổng giá trị các sách đang mượn và sách muốn mượn vượt quá khả năng bảo đảm của ví. Vui lòng nạp thêm tiền hoặc hoàn thành trả sách trước khi tiếp tục mượn.");
                return response;
            }

            // Deduct rental fee
            walletService.deduct(readerId, rentalFee,
                    com.library.wallet.domain.enums.TransactionType.RENTAL_FEE,
                    ReferenceType.BORROW, null,
                    "Phí thuê sách - đơn mượn mới");

            // Hold frozen amount (replacementPrice + depositAmount)
            walletService.hold(readerId, frozenAmount,
                    ReferenceType.BORROW, null,
                    "Giữ tiền cọc + giá sách - đơn mượn mới");

            // Generate pickup code
            String pickupCode = generatePickupCode(null);
            record.setPickupCode(pickupCode);
            record.setDepositStatus(DepositStatus.CONFIRMED);
            record.setDepositConfirmedAt(Instant.now());

            if (request.getFulfillmentMethod() == FulfillmentMethod.AT_LIBRARY) {
                record.setStatus(BorrowStatus.AWAITING_PICKUP);
                record.setReservedUntil(Instant.now().plus(RESERVATION_HOURS, ChronoUnit.HOURS));
            } else {
                record.setStatus(BorrowStatus.AWAITING_SHIPMENT);
            }
        } else {
            // Has risk → PENDING_APPROVAL, no money touched
            record.setStatus(BorrowStatus.PENDING_APPROVAL);
            record.setPendingApprovalUntil(Instant.now().plus(PENDING_APPROVAL_HOURS, ChronoUnit.HOURS));
            record.setRiskFlags(riskResult.failedFlags());
        }

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Borrow created: id={}, readerId={}, bookId={}, status={}, depositAmount={}, rentalFee={}",
                saved.getId(), readerId, request.getBookId(), saved.getStatus(), depositAmount, rentalFee);

        BorrowRecordResponse response = borrowMapper.toResponse(saved);
        enrichWithNames(response, saved);
        String message = switch (saved.getStatus()) {
            case AWAITING_PICKUP -> "Đã giữ sách. Mã nhận sách: " + saved.getPickupCode() + " — Đến thư viện nhận trong 48 giờ";
            case AWAITING_SHIPMENT -> "Đã giữ sách. Sách sẽ được giao đến bạn";
            case PENDING_APPROVAL -> "Đơn mượn đang chờ duyệt. Nhân viên sẽ xử lý trong 24 giờ";
            default -> "Đơn mượn đã được tạo";
        };
        response.setMessage(message);
        return response;
    }

    @Transactional
    public BorrowRecordResponse confirmPickupByCode(String pickupCode, UUID librarianId) {
        BorrowRecord record = borrowRecordRepository.findByPickupCode(pickupCode)
                .orElseThrow(() -> {
                    log.warn("Confirm pickup by code failed: pickupCode={} not found", pickupCode);
                    return new BorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.AWAITING_PICKUP) {
            log.warn("Confirm pickup by code failed: borrow id={} status={} is not AWAITING_PICKUP",
                    record.getId(), record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        Instant now = Instant.now();
        record.setStatus(BorrowStatus.BORROWING);
        record.setActualBorrowDate(now);
        record.setDueDate(now.plus(record.getDurationDays(), ChronoUnit.DAYS));
        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(now);

        inventoryService.transferToBorrowed(record.getBookId());

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Pickup confirmed by code: id={}, dueDate={}, librarianId={}",
                saved.getId(), saved.getDueDate(), librarianId);

        BorrowRecordResponse response = borrowMapper.toResponse(saved);
        enrichWithNames(response, saved);
        response.setMessage("Xác nhận nhận sách thành công");
        return response;
    }

    @Transactional
    public BorrowRecordResponse confirmShipment(UUID borrowId, UUID librarianId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Confirm shipment failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.AWAITING_SHIPMENT) {
            log.warn("Confirm shipment failed: borrow id={} status={} is not AWAITING_SHIPMENT",
                    borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        Instant now = Instant.now();
        record.setStatus(BorrowStatus.BORROWING);
        record.setActualBorrowDate(now);
        record.setDueDate(now.plus(record.getDurationDays(), ChronoUnit.DAYS));
        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(now);

        inventoryService.transferToBorrowed(record.getBookId());

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Shipment confirmed: id={}, dueDate={}, librarianId={}",
                saved.getId(), saved.getDueDate(), librarianId);

        BorrowRecordResponse response = borrowMapper.toResponse(saved);
        enrichWithNames(response, saved);
        response.setMessage("Xác nhận giao hàng thành công");
        return response;
    }

    // ──────────────────────────────────────────────
    // UC15a: Manual Approval (PENDING_APPROVAL)
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getAwaitingShipmentBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.AWAITING_SHIPMENT);
        log.info("Found {} awaiting shipment borrows", records.size());
        return records.stream()
                .map(r -> {
                    BorrowRecordResponse resp = borrowMapper.toResponse(r);
                    enrichWithNames(resp, r);
                    resp.setMessage("Chờ giao hàng");
                    return resp;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getPendingApprovalBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.PENDING_APPROVAL);
        log.info("Found {} pending approval borrows", records.size());
        return records.stream()
                .map(r -> {
                    BorrowRecordResponse resp = borrowMapper.toResponse(r);
                    enrichWithNames(resp, r);
                    resp.setMessage("Đang chờ duyệt");
                    return resp;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getApprovedWaitingPaymentBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.APPROVED_WAITING_PAYMENT);
        log.info("Found {} approved waiting payment borrows", records.size());
        return records.stream()
                .map(r -> {
                    BorrowRecordResponse resp = borrowMapper.toResponse(r);
                    enrichWithNames(resp, r);
                    resp.setMessage("Đã duyệt — Chờ nạp tiền");
                    return resp;
                })
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getAwaitingPickupBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.AWAITING_PICKUP);
        log.info("Found {} awaiting pickup borrows", records.size());
        return records.stream()
                .map(r -> {
                    BorrowRecordResponse resp = borrowMapper.toResponse(r);
                    enrichWithNames(resp, r);
                    resp.setMessage("Chờ nhận sách");
                    return resp;
                })
                .toList();
    }

    @Transactional
    public BorrowRecordResponse approveBorrow(UUID borrowId, UUID librarianId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Approve failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.PENDING_APPROVAL) {
            log.warn("Approve failed: borrow id={} status={} is not PENDING_APPROVAL", borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(Instant.now());

        // Pessimistic lock on wallet
        walletService.findByUserIdWithLock(record.getReaderId());

        // Check wallet balance
        BigDecimal frozenAmount = record.getReplacementPriceSnapshot().add(record.getDepositAmount());
        BigDecimal totalRequired = frozenAmount.add(record.getRentalFeeSnapshot());
        boolean walletOk = walletService.checkSufficientAvailable(record.getReaderId(), totalRequired);

        if (walletOk) {
            // Deduct rental fee
            walletService.deduct(record.getReaderId(), record.getRentalFeeSnapshot(),
                    com.library.wallet.domain.enums.TransactionType.RENTAL_FEE,
                    ReferenceType.BORROW, record.getId(),
                    "Phí thuê sách - đơn mượn " + record.getId());

            // Hold frozen amount (replacementPriceSnapshot + depositAmount)
            walletService.hold(record.getReaderId(), frozenAmount,
                    ReferenceType.BORROW, record.getId(),
                    "Giữ tiền cọc + giá sách - đơn mượn " + record.getId());

            // Generate pickup code
            String pickupCode = generatePickupCode(record.getId());
            record.setPickupCode(pickupCode);
            record.setDepositStatus(DepositStatus.CONFIRMED);
            record.setDepositConfirmedAt(Instant.now());
            record.setDepositConfirmedBy(librarianId);

            if (record.getFulfillmentMethod() == FulfillmentMethod.AT_LIBRARY) {
                record.setStatus(BorrowStatus.AWAITING_PICKUP);
                record.setReservedUntil(Instant.now().plus(RESERVATION_HOURS, ChronoUnit.HOURS));
            } else {
                record.setStatus(BorrowStatus.AWAITING_SHIPMENT);
            }

            BorrowRecord saved = borrowRecordRepository.save(record);
            log.info("Borrow approved with payment: id={}, status={}, pickupCode={}, librarianId={}",
                    saved.getId(), saved.getStatus(), pickupCode, librarianId);

            BorrowRecordResponse response = borrowMapper.toResponse(saved);
            enrichWithNames(response, saved);
            String message = record.getFulfillmentMethod() == FulfillmentMethod.AT_LIBRARY
                    ? "Đã duyệt. Mã nhận sách: " + pickupCode + " — Độc giả đến nhận trong 48 giờ"
                    : "Đã duyệt. Sách sẽ được giao đến độc giả";
            response.setMessage(message);
            return response;
        } else {
            // Insufficient balance → APPROVED_WAITING_PAYMENT
            record.setStatus(BorrowStatus.APPROVED_WAITING_PAYMENT);

            BorrowRecord saved = borrowRecordRepository.save(record);
            log.info("Borrow approved but insufficient balance: id={}, status={}, librarianId={}",
                    saved.getId(), saved.getStatus(), librarianId);

            BorrowRecordResponse response = borrowMapper.toResponse(saved);
            enrichWithNames(response, saved);
            response.setMessage("Đã duyệt. Độc giả cần nạp thêm tiền để nhận mã lấy sách");
            return response;
        }
    }

    @Transactional
    public BorrowRecordResponse rejectBorrow(UUID borrowId, String reason, UUID librarianId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Reject failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.PENDING_APPROVAL) {
            log.warn("Reject failed: borrow id={} status={} is not PENDING_APPROVAL", borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        // Safety: release hold if deposit was somehow confirmed (shouldn't happen in new flow)
        if (record.getDepositStatus() == DepositStatus.CONFIRMED) {
            BigDecimal frozenAmount = record.getReplacementPriceSnapshot()
                    .add(record.getDepositAmount());
            walletService.releaseHold(record.getReaderId(), frozenAmount,
                    ReferenceType.BORROW, record.getId(),
                    "Hoàn tiền cọc + giá sách - đơn mượn bị từ chối");
            walletService.topUp(record.getReaderId(), record.getRentalFeeSnapshot(),
                    "Hoàn phí thuê - đơn mượn bị từ chối");
        }

        record.setStatus(BorrowStatus.REJECTED);
        record.setRejectionReason(reason);
        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(Instant.now());

        inventoryService.restoreStock(record.getBookId());

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Borrow rejected: id={}, librarianId={}, reason={}", saved.getId(), librarianId, reason);

        BorrowRecordResponse response = borrowMapper.toResponse(saved);
        enrichWithNames(response, saved);
        response.setMessage("Từ chối mượn thành công");
        return response;
    }

    // ──────────────────────────────────────────────
    // UC15b: Pickup Confirmation (RESERVED → BORROWING)
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<BorrowRecordResponse> getReservedBorrows() {
        List<BorrowRecord> records = borrowRecordRepository.findByStatusOrderByCreatedAtAsc(BorrowStatus.RESERVED);
        log.info("Found {} reserved borrows", records.size());
        return records.stream()
                .map(r -> {
                    BorrowRecordResponse resp = borrowMapper.toResponse(r);
                    enrichWithNames(resp, r);
                    resp.setMessage("Đã giữ sách — Chờ nhận");
                    return resp;
                })
                .toList();
    }

    @Transactional
    public BorrowRecordResponse confirmPickup(UUID borrowId, UUID librarianId) {
        BorrowRecord record = borrowRecordRepository.findById(borrowId)
                .orElseThrow(() -> {
                    log.warn("Confirm pickup failed: borrow not found id={}", borrowId);
                    return new BorrowNotFoundException();
                });

        if (record.getStatus() != BorrowStatus.RESERVED && record.getStatus() != BorrowStatus.AWAITING_PICKUP) {
            log.warn("Confirm pickup failed: borrow id={} status={} is not RESERVED or AWAITING_PICKUP", borrowId, record.getStatus());
            throw new InvalidStatusTransitionException();
        }

        Instant now = Instant.now();
        record.setStatus(BorrowStatus.BORROWING);
        record.setActualBorrowDate(now);
        record.setDueDate(now.plus(record.getDurationDays(), ChronoUnit.DAYS));
        record.setConfirmedBy(librarianId);
        record.setConfirmedAt(now);

        inventoryService.transferToBorrowed(record.getBookId());

        BorrowRecord saved = borrowRecordRepository.save(record);
        log.info("Pickup confirmed: id={}, dueDate={}, librarianId={}", saved.getId(), saved.getDueDate(), librarianId);

        BorrowRecordResponse response = borrowMapper.toResponse(saved);
        enrichWithNames(response, saved);
        response.setMessage("Xác nhận nhận sách thành công");
        return response;
    }

    // ──────────────────────────────────────────────
    // Process APPROVED_WAITING_PAYMENT when reader tops up
    // ──────────────────────────────────────────────

    @Transactional
    public void processApprovedWaitingPayment(UUID readerId) {
        List<BorrowRecord> waitingPayments = borrowRecordRepository
                .findByStatusOrderByCreatedAtAsc(BorrowStatus.APPROVED_WAITING_PAYMENT)
                .stream()
                .filter(r -> r.getReaderId().equals(readerId))
                .toList();

        for (BorrowRecord record : waitingPayments) {
            try {
                BigDecimal frozenAmount = record.getReplacementPriceSnapshot().add(record.getDepositAmount());
                BigDecimal totalRequired = frozenAmount.add(record.getRentalFeeSnapshot());
                boolean walletOk = walletService.checkSufficientAvailable(readerId, totalRequired);
                if (!walletOk) {
                    continue;
                }

                walletService.findByUserIdWithLock(readerId);

                // Recheck after lock
                walletOk = walletService.checkSufficientAvailable(readerId, totalRequired);
                if (!walletOk) {
                    continue;
                }

                // Deduct rental fee
                walletService.deduct(readerId, record.getRentalFeeSnapshot(),
                        com.library.wallet.domain.enums.TransactionType.RENTAL_FEE,
                        ReferenceType.BORROW, record.getId(),
                        "Phí thuê sách - đơn mượn " + record.getId());

                // Hold frozen amount (replacementPriceSnapshot + depositAmount)
                walletService.hold(readerId, frozenAmount,
                        ReferenceType.BORROW, record.getId(),
                        "Giữ tiền cọc + giá sách - đơn mượn " + record.getId());

                // Generate pickup code
                String pickupCode = generatePickupCode(record.getId());
                record.setPickupCode(pickupCode);
                record.setDepositStatus(DepositStatus.CONFIRMED);
                record.setDepositConfirmedAt(Instant.now());

                if (record.getFulfillmentMethod() == FulfillmentMethod.AT_LIBRARY) {
                    record.setStatus(BorrowStatus.AWAITING_PICKUP);
                    record.setReservedUntil(Instant.now().plus(RESERVATION_HOURS, ChronoUnit.HOURS));
                } else {
                    record.setStatus(BorrowStatus.AWAITING_SHIPMENT);
                }

                borrowRecordRepository.save(record);
                log.info("Approved waiting payment processed: id={}, status={}, pickupCode={}",
                        record.getId(), record.getStatus(), pickupCode);
            } catch (Exception e) {
                log.error("Failed to process approved waiting payment for borrow id={}: {}",
                        record.getId(), e.getMessage());
            }
        }
    }

    // ──────────────────────────────────────────────
    // UC15b: Lookup by pickup code
    // ──────────────────────────────────────────────

    @Transactional(readOnly = true)
    public BorrowRecordResponse lookupByPickupCode(String pickupCode) {
        BorrowRecord record = borrowRecordRepository.findByPickupCode(pickupCode)
                .orElseThrow(() -> {
                    log.warn("Lookup by pickup code failed: pickupCode={} not found", pickupCode);
                    return new BorrowNotFoundException();
                });
        BorrowRecordResponse response = borrowMapper.toResponse(record);
        enrichWithNames(response, record);
        return response;
    }

    private void enrichWithNames(BorrowRecordResponse response, BorrowRecord record) {
        bookRepository.findByIdNotDeleted(record.getBookId())
                .ifPresent(book -> response.setBookTitle(book.getTitle()));
        response.setReaderName(userProfileRepository.getNameByUserId(record.getReaderId()));
    }

    private Integer resolveDepositRate(UUID depositPolicyId) {
        if (depositPolicyId == null) {
            return 20; // default 20%
        }
        DepositPolicy policy = depositPolicyRepository.findById(depositPolicyId)
                .orElse(null);
        return policy != null ? policy.getDepositRate() : 20; // default 20%
    }

    private static final String PICKUP_CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();

    private String generatePickupCode(UUID borrowId) {
        StringBuilder sb = new StringBuilder("LIB-");
        for (int i = 0; i < 6; i++) {
            sb.append(PICKUP_CHARS.charAt(SECURE_RANDOM.nextInt(PICKUP_CHARS.length())));
        }
        return sb.toString();
    }
}
