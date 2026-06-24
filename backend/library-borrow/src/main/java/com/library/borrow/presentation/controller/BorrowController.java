package com.library.borrow.presentation.controller;

import com.library.borrow.application.service.BorrowQueryService;
import com.library.borrow.application.service.BorrowService;
import com.library.book.domain.entity.DepositPolicy;
import com.library.borrow.domain.entity.RentalRate;
import com.library.borrow.domain.exception.StatusFilterInvalidException;
import com.library.borrow.domain.port.DepositPolicyRepository;
import com.library.borrow.domain.port.RentalRateRepository;
import com.library.borrow.presentation.dto.request.CreateBorrowRequest;
import com.library.borrow.presentation.dto.request.RejectBorrowRequest;
import com.library.borrow.presentation.dto.response.BorrowHistoryResponse;
import com.library.borrow.presentation.dto.response.BorrowRecordResponse;
import com.library.borrow.presentation.dto.response.DepositPolicyResponse;
import com.library.borrow.presentation.dto.response.RentalRateResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/borrows")
@RequiredArgsConstructor
@Validated
public class BorrowController {

    private final BorrowService borrowService;
    private final BorrowQueryService borrowQueryService;
    private final RentalRateRepository rentalRateRepository;
    private final DepositPolicyRepository depositPolicyRepository;

    @PostMapping
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<BorrowRecordResponse> createBorrowRequest(
            @Valid @RequestBody CreateBorrowRequest request,
            Authentication authentication) {

        UUID readerId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.createBorrowRequest(readerId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ── UC15a: List PENDING_APPROVAL (Librarian only) ──
    @GetMapping(params = "status=PENDING_APPROVAL")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getPendingApprovalBorrows() {
        List<BorrowRecordResponse> responses = borrowService.getPendingApprovalBorrows();
        return ResponseEntity.ok(responses);
    }

    // ── UC15a: Approve borrow ──
    @PatchMapping("/{borrowId}/approve")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> approveBorrow(
            @PathVariable UUID borrowId,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.approveBorrow(borrowId, librarianId);
        return ResponseEntity.ok(response);
    }

    // ── UC15a: Reject borrow ──
    @PatchMapping("/{borrowId}/reject")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> rejectBorrow(
            @PathVariable UUID borrowId,
            @Valid @RequestBody RejectBorrowRequest request,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.rejectBorrow(borrowId, request.getRejectionReason(), librarianId);
        return ResponseEntity.ok(response);
    }

    // ── UC15b: List RESERVED (Librarian only) ──
    @GetMapping(params = "status=RESERVED")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getReservedBorrows() {
        List<BorrowRecordResponse> responses = borrowService.getReservedBorrows();
        return ResponseEntity.ok(responses);
    }

    // ── UC15b: Confirm pickup ──
    @PatchMapping("/{borrowId}/confirm-pickup")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> confirmPickup(
            @PathVariable UUID borrowId,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.confirmPickup(borrowId, librarianId);
        return ResponseEntity.ok(response);
    }

    // ── Deposit: List AWAITING_PICKUP (Librarian only) ──
    @GetMapping(params = "status=AWAITING_PICKUP")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getAwaitingPickupBorrows() {
        List<BorrowRecordResponse> responses = borrowService.getAwaitingPickupBorrows();
        return ResponseEntity.ok(responses);
    }

    // ── Pickup: Confirm by pickup code (Librarian only) ──
    @PatchMapping("/pickup/{pickupCode}")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> confirmPickupByCode(
            @PathVariable String pickupCode,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.confirmPickupByCode(pickupCode, librarianId);
        return ResponseEntity.ok(response);
    }

    // ── Shipment: Confirm shipment (Librarian only) ──
    @PatchMapping("/{borrowId}/confirm-shipment")
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> confirmShipment(
            @PathVariable UUID borrowId,
            Authentication authentication) {

        UUID librarianId = extractUserId(authentication);
        BorrowRecordResponse response = borrowService.confirmShipment(borrowId, librarianId);
        return ResponseEntity.ok(response);
    }

    // ── Lookup borrow by pickup code (Reader or Librarian) ──
    @GetMapping("/lookup/{pickupCode}")
    @PreAuthorize("hasAnyRole('READER', 'LIBRARIAN', 'ADMIN')")
    public ResponseEntity<BorrowRecordResponse> lookupByPickupCode(
            @PathVariable String pickupCode) {
        BorrowRecordResponse response = borrowService.lookupByPickupCode(pickupCode);
        return ResponseEntity.ok(response);
    }

    // ── Public: Rental rates ──
    @GetMapping("/rental-rates")
    public ResponseEntity<List<RentalRateResponse>> getRentalRates() {
        List<RentalRateResponse> rates = rentalRateRepository.findByIsActiveTrue().stream()
                .map(r -> RentalRateResponse.builder()
                        .id(r.getId())
                        .name(r.getName())
                        .minDays(r.getMinDays())
                        .maxDays(r.getMaxDays())
                        .fee(r.getFee())
                        .build())
                .toList();
        return ResponseEntity.ok(rates);
    }

    // ── Public: Deposit policies ──
    @GetMapping("/deposit-policies")
    public ResponseEntity<List<DepositPolicyResponse>> getDepositPolicies() {
        List<DepositPolicyResponse> policies = depositPolicyRepository.findByIsActiveTrue().stream()
                .map(p -> DepositPolicyResponse.builder()
                        .id(p.getId())
                        .code(p.getCode())
                        .name(p.getName())
                        .depositRate(p.getDepositRate())
                        .description(p.getDescription())
                        .build())
                .toList();
        return ResponseEntity.ok(policies);
    }

    // ── List all borrows with status param (Librarian only) ──
    @GetMapping
    @PreAuthorize("hasAnyRole('LIBRARIAN', 'ADMIN')")
    public ResponseEntity<List<BorrowRecordResponse>> getBorrowsByStatus(
            @RequestParam(required = false) String status) {

        if (status == null) {
            return ResponseEntity.ok(List.of());
        }
        return switch (status.toUpperCase()) {
            case "PENDING_APPROVAL" -> ResponseEntity.ok(borrowService.getPendingApprovalBorrows());
            case "RESERVED" -> ResponseEntity.ok(borrowService.getReservedBorrows());
            case "AWAITING_PICKUP" -> ResponseEntity.ok(borrowService.getAwaitingPickupBorrows());
            case "AWAITING_SHIPMENT" -> ResponseEntity.ok(borrowService.getAwaitingShipmentBorrows());
            case "APPROVED_WAITING_PAYMENT" -> ResponseEntity.ok(borrowService.getApprovedWaitingPaymentBorrows());
            default ->
                throw new StatusFilterInvalidException();
        };
    }

    // ── UC16: Get borrow history (Reader only) ──
    @GetMapping("/my-history")
    @PreAuthorize("hasRole('READER')")
    public ResponseEntity<BorrowHistoryResponse> getMyHistory(
            @RequestParam(required = false)
            @Pattern(regexp = "^(PENDING_APPROVAL|RESERVED|REJECTED|BORROWING|OVERDUE|RETURNED|CANCELLED|RETURN_PENDING|AWAITING_DEPOSIT|AWAITING_PICKUP|AWAITING_SHIPMENT|IN_DELIVERY|DELIVERED_PENDING|DELIVERY_ISSUE|DELIVERY_FAILED|DELIVERY_LOST|RETURN_REQUESTED|RETURN_IN_TRANSIT|RETURN_RECEIVED|RETURN_SHIPPING_FAILED|RETURN_SHIPPING_LOST)$",
                    message = "Trạng thái lọc không hợp lệ")
            String status,
            @RequestParam(defaultValue = "0") @Min(0) @Max(9999) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size,
            Authentication authentication) {

        UUID readerId = extractUserId(authentication);
        BorrowHistoryResponse response = borrowQueryService.getBorrowHistory(readerId, status, page, size);
        return ResponseEntity.ok(response);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        Object principal = authentication.getPrincipal();
        if (principal instanceof com.library.auth.domain.entity.User user) {
            return user.getId();
        }
        String name = authentication.getName();
        try {
            return UUID.fromString(name);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
