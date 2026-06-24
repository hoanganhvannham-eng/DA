package com.library.borrow.infrastructure.persistence;

import com.library.book.domain.entity.Book;
import com.library.borrow.domain.port.BookRepository;
import com.library.borrow.domain.port.BookRepository.BookDepositInfo;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class BookRepositoryAdapter implements BookRepository {

    private final EntityManager entityManager;

    @Override
    public Optional<Book> findByIdNotDeleted(UUID bookId) {
        List<Book> results = entityManager.createQuery(
                        "SELECT b FROM Book b WHERE b.id = :id AND b.isDeleted = false", Book.class)
                .setParameter("id", bookId)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public int getAvailableQuantityForUpdate(UUID bookId) {
        Integer quantity = entityManager.createQuery(
                        "SELECT b.availableQuantity FROM Book b WHERE b.id = :id", Integer.class)
                .setParameter("id", bookId)
                .setLockMode(LockModeType.PESSIMISTIC_WRITE)
                .getSingleResult();
        return quantity != null ? quantity : 0;
    }

    @Override
    public void decrementStockForUpdate(UUID bookId) {
        entityManager.createQuery(
                        "UPDATE Book b SET b.availableQuantity = b.availableQuantity - 1 WHERE b.id = :id")
                .setParameter("id", bookId)
                .executeUpdate();
    }

    @Override
    public void incrementStock(UUID bookId) {
        entityManager.createQuery(
                        "UPDATE Book b SET b.availableQuantity = b.availableQuantity + 1 WHERE b.id = :id")
                .setParameter("id", bookId)
                .executeUpdate();
    }

    @Override
    public void incrementBorrowedQuantity(UUID bookId) {
        entityManager.createQuery(
                        "UPDATE Book b SET b.borrowedQuantity = b.borrowedQuantity + 1 WHERE b.id = :id")
                .setParameter("id", bookId)
                .executeUpdate();
    }

    @Override
    public void incrementLostCount(UUID bookId) {
        entityManager.createQuery(
                        "UPDATE Book b SET b.lostCount = b.lostCount + 1 WHERE b.id = :id")
                .setParameter("id", bookId)
                .executeUpdate();
    }

    @Override
    public void decrementAvailableQuantity(UUID bookId) {
        entityManager.createQuery(
                        "UPDATE Book b SET b.availableQuantity = b.availableQuantity - 1 WHERE b.id = :id AND b.availableQuantity > 0")
                .setParameter("id", bookId)
                .executeUpdate();
    }

    @Override
    public Optional<BookDepositInfo> findDepositInfoByBookId(UUID bookId) {
        List<Object[]> results = entityManager.createQuery(
                        "SELECT b.id, b.replacementPrice, b.depositPolicy.id, b.customDepositRate " +
                        "FROM Book b WHERE b.id = :bookId AND b.isDeleted = false", Object[].class)
                .setParameter("bookId", bookId)
                .getResultList();
        if (results.isEmpty()) {
            return Optional.empty();
        }
        Object[] row = results.get(0);
        java.math.BigDecimal replacementPrice = row[1] != null ? new java.math.BigDecimal(row[1].toString()) : null;
        UUID depositPolicyId = (UUID) row[2];
        java.math.BigDecimal customDepositRate = row[3] != null ? new java.math.BigDecimal(row[3].toString()) : null;
        return Optional.of(new BookDepositInfo(bookId, replacementPrice, depositPolicyId, customDepositRate));
    }
}
