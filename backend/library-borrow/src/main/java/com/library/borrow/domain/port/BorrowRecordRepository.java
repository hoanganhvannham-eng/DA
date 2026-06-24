package com.library.borrow.domain.port;

import com.library.borrow.domain.entity.BorrowRecord;
import com.library.borrow.domain.enums.BorrowStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BorrowRecordRepository extends JpaRepository<BorrowRecord, UUID> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT b FROM BorrowRecord b WHERE b.id = :id")
    java.util.Optional<BorrowRecord> findByIdWithLock(@Param("id") UUID id);

    List<BorrowRecord> findByStatusOrderByCreatedAtAsc(BorrowStatus status);

    List<BorrowRecord> findByStatusIn(List<BorrowStatus> statuses, Sort sort);

    Page<BorrowRecord> findByStatusIn(List<BorrowStatus> statuses, Pageable pageable);

    Page<BorrowRecord> findByStatusInAndBookIdIn(List<BorrowStatus> statuses, List<UUID> bookIds, Pageable pageable);

    Page<BorrowRecord> findByStatusInAndReturnMethod(List<BorrowStatus> statuses, String returnMethod, Pageable pageable);

    Page<BorrowRecord> findByStatusInAndReturnMethodAndBookIdIn(List<BorrowStatus> statuses, String returnMethod, List<UUID> bookIds, Pageable pageable);

    Page<BorrowRecord> findByStatus(BorrowStatus status, Pageable pageable);

    @Query("SELECT b FROM BorrowRecord b WHERE b.status = :status ORDER BY b.createdAt ASC")
    List<BorrowRecord> findAllByStatus(@Param("status") BorrowStatus status);

    Optional<BorrowRecord> findByPickupCode(String pickupCode);

    @Query("SELECT COUNT(b) FROM BorrowRecord b WHERE b.readerId = :readerId " +
            "AND b.status NOT IN ('RETURNED', 'CANCELLED', 'REJECTED')")
    int countActiveByReaderId(@Param("readerId") UUID readerId);

    @Query("SELECT COUNT(b) FROM BorrowRecord b WHERE b.readerId = :readerId " +
            "AND b.status = 'OVERDUE' AND b.dueDate >= :since")
    int countOverdueSince(@Param("readerId") UUID readerId, @Param("since") java.time.Instant since);

    @Query(value = "SELECT COUNT(*) FROM borrow_records " +
            "WHERE reader_id = UUID_TO_BIN(:readerId, 0) " +
            "AND status = 'OVERDUE' " +
            "AND due_date >= DATE_SUB(NOW(), INTERVAL 6 MONTH)", nativeQuery = true)
    int countOverdueInLast6Months(@Param("readerId") String readerId);

    @Query(value = """
            SELECT
              br.id           AS id,
              b.title         AS bookTitle,
              b.author        AS bookAuthor,
              br.status       AS status,
              br.borrow_date  AS borrowDate,
              br.due_date     AS dueDate,
              br.actual_borrow_date AS actualBorrowDate,
              br.rejection_reason AS rejectionReason,
              br.fulfillment_method AS fulfillmentMethod,
              br.shipping_address AS shippingAddress,
              br.extension_count AS extensionCount,
              so.tracking_number AS trackingNumber,
              so.status       AS shippingStatus,
              br.risk_flags   AS riskFlags,
              br.reserved_until AS reservedUntil,
              br.pending_approval_until AS pendingApprovalUntil,
              br.return_method AS returnMethod,
              br.returned_at  AS returnedAt,
              br.created_at   AS createdAt,
              br.deposit_amount AS depositAmount,
              br.deposit_status AS depositStatus,
              br.pickup_code  AS pickupCode,
              br.rental_fee_snapshot AS rentalFeeSnapshot,
              br.replacement_price_snapshot AS replacementPriceSnapshot,
              br.deposit_rate_snapshot AS depositRateSnapshot,
              br.refund_method AS refundMethod
            FROM borrow_records br
            JOIN books b ON br.book_id = b.id
            LEFT JOIN shipping_orders so
              ON br.id = so.borrow_record_id AND so.shipping_type = 'DELIVERY'
            WHERE br.reader_id = :readerIdBytes
            AND (:status IS NULL OR br.status = :status)
            ORDER BY br.created_at DESC
            """,
            countQuery = """
            SELECT COUNT(*)
            FROM borrow_records br
            WHERE br.reader_id = :readerIdBytes
            AND (:status IS NULL OR br.status = :status)
            """,
            nativeQuery = true)
    Page<com.library.borrow.infrastructure.persistence.BorrowHistoryProjection> findBorrowHistoryRaw(
            @Param("readerIdBytes") byte[] readerIdBytes,
            @Param("status") String status,
            Pageable pageable);
}
