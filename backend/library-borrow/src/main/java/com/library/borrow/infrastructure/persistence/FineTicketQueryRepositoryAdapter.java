package com.library.borrow.infrastructure.persistence;

import com.library.borrow.domain.port.FineTicketQueryRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class FineTicketQueryRepositoryAdapter implements FineTicketQueryRepository {

    private final EntityManager entityManager;

    @Override
    public int countUnpaidByReaderId(UUID readerId) {
        Number count = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) FROM fine_tickets WHERE reader_id = UUID_TO_BIN(:readerId, 0) AND status = 'UNPAID'")
                .setParameter("readerId", readerId.toString())
                .getSingleResult();
        return count.intValue();
    }

    @Override
    public int countPendingConfirmByReaderId(UUID readerId) {
        Number count = (Number) entityManager
                .createNativeQuery(
                        "SELECT COUNT(*) FROM fine_tickets WHERE reader_id = UUID_TO_BIN(:readerId, 0) AND status = 'PENDING_CONFIRM'")
                .setParameter("readerId", readerId.toString())
                .getSingleResult();
        return count.intValue();
    }
}
