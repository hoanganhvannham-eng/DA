package com.library.book.infrastructure.persistence;

import com.library.book.domain.entity.Book;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookRepository extends JpaRepository<Book, UUID> {

    @Query("SELECT b FROM Book b WHERE b.id = :id AND b.isDeleted = false")
    Optional<Book> findByIdAndNotDeleted(@Param("id") UUID id);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.isbn = :isbn AND b.isDeleted = false")
    long countByIsbnAndNotDeleted(@Param("isbn") String isbn);

    @Query("SELECT COUNT(b) FROM Book b WHERE b.isbn = :isbn AND b.id != :excludeId AND b.isDeleted = false")
    long countByIsbnAndNotDeletedExcludingId(@Param("isbn") String isbn, @Param("excludeId") UUID excludeId);

    @Query(value = "SELECT COUNT(*) FROM borrow_records " +
            "WHERE book_id = UUID_TO_BIN(:bookId, 0) " +
            "AND status NOT IN ('RETURNED', 'CANCELLED', 'REJECTED')",
            nativeQuery = true)
    int countNonTerminalBorrowsByBookId(@Param("bookId") String bookId);

    List<Book> findByTitleContainingIgnoreCaseAndIsDeletedFalse(String title);

    @Query("SELECT b FROM Book b " +
            "WHERE b.isDeleted = false " +
            "AND (:search IS NULL OR LOWER(b.title) LIKE LOWER(CONCAT('%', :search, '%')) " +
            "     OR LOWER(b.author) LIKE LOWER(CONCAT('%', :search, '%'))) " +
            "AND (:categoryId IS NULL OR b.category.id = :categoryId)")
    Page<Book> findAllFiltered(
            @Param("search") String search,
            @Param("categoryId") UUID categoryId,
            Pageable pageable
    );

    @Modifying
    @Query("UPDATE Book b SET b.availableQuantity = b.availableQuantity + 1, " +
            "b.borrowedQuantity = b.borrowedQuantity - 1 WHERE b.id = :bookId")
    int updateForNormalReturn(@Param("bookId") UUID bookId);

    @Modifying
    @Query("UPDATE Book b SET b.borrowedQuantity = b.borrowedQuantity - 1, " +
            "b.damagedCount = b.damagedCount + 1 WHERE b.id = :bookId")
    int updateForDamagedReturn(@Param("bookId") UUID bookId);

    @Modifying
    @Query("UPDATE Book b SET b.borrowedQuantity = b.borrowedQuantity - 1, " +
            "b.lostCount = b.lostCount + 1 WHERE b.id = :bookId")
    int updateForLostReturn(@Param("bookId") UUID bookId);
}
