package com.library.fine.domain.entity;

import com.library.fine.domain.enums.FineStatus;
import com.library.fine.domain.enums.FineType;
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
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "fine_tickets", indexes = {
    @Index(name = "idx_fine_tickets_borrow_record_id", columnList = "borrow_record_id"),
    @Index(name = "idx_fine_tickets_reader_id", columnList = "reader_id"),
    @Index(name = "idx_fine_tickets_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineTicket {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", columnDefinition = "BINARY(16)")
    private UUID id;

    @Column(name = "borrow_record_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID borrowRecordId;

    @Column(name = "reader_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID readerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "fine_type", nullable = false, length = 20)
    private FineType fineType;

    @Column(name = "fine_level_id", nullable = false, columnDefinition = "BINARY(16)")
    private UUID fineLevelId;

    @Column(name = "amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(name = "remaining_amount", precision = 12, scale = 2)
    private BigDecimal remainingAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    private FineStatus status = FineStatus.UNPAID;

    @Column(name = "note", length = 500)
    private String note;

    @Column(name = "payment_proof_url", length = 1024)
    private String paymentProofUrl;

    @Column(name = "proof_submitted_at")
    private Instant proofSubmittedAt;

    @Column(name = "rejection_reason", length = 500)
    private String rejectionReason;

    @Column(name = "void_reason", length = 500)
    private String voidReason;

    @Column(name = "confirmed_by", columnDefinition = "BINARY(16)")
    private UUID confirmedBy;

    @Column(name = "confirmed_at")
    private Instant confirmedAt;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null) this.status = FineStatus.UNPAID;
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = Instant.now();
    }
}
