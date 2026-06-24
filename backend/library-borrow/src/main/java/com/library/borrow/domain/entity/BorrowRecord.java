package com.library.borrow.domain.entity;

import com.library.borrow.domain.enums.BorrowStatus;
import com.library.borrow.domain.enums.DepositStatus;
import com.library.borrow.domain.enums.FulfillmentMethod;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "borrow_records", indexes = {
    @Index(name = "idx_borrow_records_reader_id", columnList = "reader_id"),
    @Index(name = "idx_borrow_records_book_id", columnList = "book_id"),
    @Index(name = "idx_borrow_records_status", columnList = "status")
})
@Getter
@Setter
@NoArgsConstructor
public class BorrowRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "reader_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID readerId;

    @Column(name = "book_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID bookId;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private BorrowStatus status;

    @Column(name = "borrow_date", nullable = false, updatable = false)
    private Instant borrowDate;

    @Column(name = "due_date")
    private Instant dueDate;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays = 14;

    @Column(name = "actual_borrow_date")
    private Instant actualBorrowDate;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "confirmed_by", columnDefinition = "BINARY(16)")
    private UUID confirmedBy;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "fulfillment_method", nullable = false, length = 20)
    private FulfillmentMethod fulfillmentMethod;

    @Column(name = "shipping_address", length = 255)
    private String shippingAddress;

    @Column(name = "return_method", length = 20)
    private String returnMethod;

    @Column(name = "pickup_address", length = 255)
    private String pickupAddress;

    @Column(name = "returned_at")
    private Instant returnedAt;

    @Column(name = "book_condition", length = 20)
    private String bookCondition;

    @Column(name = "return_lost_resolution", length = 32)
    private String returnLostResolution;

    @Column(name = "investigation_note", length = 500)
    private String investigationNote;

    @Column(name = "extension_count", nullable = false)
    private Integer extensionCount = 0;

    @Column(name = "delivery_attempt_count", nullable = false)
    private Integer deliveryAttemptCount = 0;

    @Column(name = "issue_type", length = 32)
    private String issueType;

    @Column(name = "issue_description", length = 500)
    private String issueDescription;

    @Column(name = "librarian_note", length = 500)
    private String librarianNote;

    @Column(name = "auto_confirmed", nullable = false)
    private Boolean autoConfirmed = false;

    @Column(name = "replacement_book_id", columnDefinition = "BINARY(16)")
    private UUID replacementBookId;

    @Column(name = "return_attempt_count", nullable = false)
    private Integer returnAttemptCount = 0;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "risk_flags")
    private List<String> riskFlags;

    @Column(name = "reserved_until")
    private Instant reservedUntil;

    @Column(name = "pending_approval_until")
    private Instant pendingApprovalUntil;

    @Version
    @Column(name = "version", nullable = false)
    private Long version = 0L;

    @Column(name = "deposit_amount", precision = 12, scale = 2)
    private BigDecimal depositAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "deposit_status", length = 20)
    private DepositStatus depositStatus = DepositStatus.PENDING;

    @Column(name = "deposit_confirmed_at")
    private Instant depositConfirmedAt;

    @Column(name = "deposit_confirmed_by", columnDefinition = "BINARY(16)")
    private UUID depositConfirmedBy;

    @Column(name = "pickup_code", length = 20)
    private String pickupCode;

    @Column(name = "rental_rate_id", columnDefinition = "BINARY(16)")
    private UUID rentalRateId;

    @Column(name = "rental_fee_snapshot", precision = 12, scale = 2)
    private BigDecimal rentalFeeSnapshot;

    @Column(name = "replacement_price_snapshot", precision = 12, scale = 2)
    private BigDecimal replacementPriceSnapshot;

    @Column(name = "deposit_rate_snapshot")
    private Integer depositRateSnapshot;

    @Column(name = "refund_method", length = 20)
    private String refundMethod;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        this.borrowDate = now;
        if (this.durationDays == null) this.durationDays = 14;
        if (this.extensionCount == null) this.extensionCount = 0;
        if (this.deliveryAttemptCount == null) this.deliveryAttemptCount = 0;
        if (this.returnAttemptCount == null) this.returnAttemptCount = 0;
        if (this.autoConfirmed == null) this.autoConfirmed = false;
        if (this.version == null) this.version = 0L;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
