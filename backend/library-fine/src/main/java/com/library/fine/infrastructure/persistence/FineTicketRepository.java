package com.library.fine.infrastructure.persistence;

import com.library.fine.domain.entity.FineTicket;
import com.library.fine.domain.enums.FineStatus;
import com.library.fine.domain.enums.FineType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import jakarta.persistence.Tuple;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FineTicketRepository extends JpaRepository<FineTicket, UUID> {

    List<FineTicket> findByBorrowRecordIdAndFineTypeAndStatus(
            UUID borrowRecordId, FineType fineType, FineStatus status);

    @Modifying
    @Query("UPDATE FineTicket ft SET ft.status = 'VOID', ft.voidReason = :voidReason, ft.updatedAt = CURRENT_TIMESTAMP " +
            "WHERE ft.borrowRecordId = :borrowRecordId AND ft.fineType = 'OVERDUE' AND ft.status = 'UNPAID'")
    int voidOverdueFinesByBorrowRecordId(
            @Param("borrowRecordId") UUID borrowRecordId,
            @Param("voidReason") String voidReason);

    List<FineTicket> findByBorrowRecordId(UUID borrowRecordId);

    List<FineTicket> findByReaderIdOrderByCreatedAtDesc(UUID readerId);

    long countByReaderIdAndStatusIn(UUID readerId, List<FineStatus> statuses);

    @Query("SELECT ft FROM FineTicket ft WHERE ft.id = :id AND ft.readerId = :readerId")
    Optional<FineTicket> findByIdAndReaderId(@Param("id") UUID id, @Param("readerId") UUID readerId);

    @Query(value = """
            SELECT ft.id, ft.borrow_record_id, ft.reader_id, ft.fine_type, ft.fine_level_id,
                   ft.amount, ft.remaining_amount, ft.status, ft.note, ft.payment_proof_url, ft.proof_submitted_at,
                   ft.rejection_reason, ft.void_reason, ft.confirmed_by, ft.confirmed_at,
                   ft.created_at, ft.updated_at,
                   b.title AS book_title, b.id AS book_id, u.name AS reader_name
            FROM fine_tickets ft
            JOIN borrow_records br ON br.id = ft.borrow_record_id
            JOIN books b ON b.id = br.book_id
            JOIN users u ON u.id = ft.reader_id
            WHERE ft.status = 'PENDING_CONFIRM'
            ORDER BY ft.updated_at ASC
            """,
            countQuery = """
            SELECT COUNT(*) FROM fine_tickets ft
            JOIN borrow_records br ON br.id = ft.borrow_record_id
            JOIN books b ON b.id = br.book_id
            JOIN users u ON u.id = ft.reader_id
            WHERE ft.status = 'PENDING_CONFIRM'
            """,
            nativeQuery = true)
    Page<Tuple> findPendingConfirmFines(Pageable pageable);

    @Query(value = """
            SELECT ft.id, ft.borrow_record_id, ft.reader_id, ft.fine_type, ft.fine_level_id,
                   ft.amount, ft.remaining_amount, ft.status, ft.note, ft.payment_proof_url, ft.proof_submitted_at,
                   ft.rejection_reason, ft.void_reason, ft.confirmed_by, ft.confirmed_at,
                   ft.created_at, ft.updated_at,
                   b.title AS book_title, b.id AS book_id, u.name AS reader_name
            FROM fine_tickets ft
            JOIN borrow_records br ON br.id = ft.borrow_record_id
            JOIN books b ON b.id = br.book_id
            JOIN users u ON u.id = ft.reader_id
            WHERE ft.id = :fineId
            """, nativeQuery = true)
    Optional<Tuple> findDetailById(@Param("fineId") UUID fineId);
}
