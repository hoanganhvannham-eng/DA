package com.library.shipping.infrastructure.persistence;

import com.library.shipping.domain.entity.ShippingOrder;
import com.library.shipping.domain.enums.ShippingOrderStatus;
import com.library.shipping.domain.enums.ShippingType;
import com.library.shipping.domain.port.ShippingOrderRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.LockModeType;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
@RequiredArgsConstructor
public class ShippingOrderRepositoryImpl implements ShippingOrderRepository {

    private final EntityManager entityManager;

    @Override
    public ShippingOrder save(ShippingOrder shippingOrder) {
        if (shippingOrder.getId() == null) {
            entityManager.persist(shippingOrder);
            return shippingOrder;
        }
        return entityManager.merge(shippingOrder);
    }

    @Override
    public Optional<ShippingOrder> findById(UUID id) {
        ShippingOrder order = entityManager.find(ShippingOrder.class, id);
        return Optional.ofNullable(order);
    }

    @Override
    public List<ShippingOrder> findByBorrowRecordIdAndType(UUID borrowRecordId, ShippingType type) {
        return entityManager.createQuery(
                        "SELECT s FROM ShippingOrder s WHERE s.borrowRecordId = :borrowId AND s.type = :type",
                        ShippingOrder.class)
                .setParameter("borrowId", borrowRecordId)
                .setParameter("type", type)
                .getResultList();
    }

    @Override
    public List<ShippingOrder> findByBorrowRecordIdInAndType(List<UUID> borrowRecordIds, ShippingType type) {
        if (borrowRecordIds.isEmpty()) {
            return List.of();
        }
        return entityManager.createQuery(
                        "SELECT s FROM ShippingOrder s WHERE s.borrowRecordId IN :ids AND s.type = :type",
                        ShippingOrder.class)
                .setParameter("ids", borrowRecordIds)
                .setParameter("type", type)
                .getResultList();
    }

    @Override
    public int countByBorrowRecordIdAndType(UUID borrowRecordId, ShippingType type) {
        Long count = entityManager.createQuery(
                        "SELECT COUNT(s) FROM ShippingOrder s WHERE s.borrowRecordId = :borrowId AND s.type = :type",
                        Long.class)
                .setParameter("borrowId", borrowRecordId)
                .setParameter("type", type)
                .getSingleResult();
        return count != null ? count.intValue() : 0;
    }

    @Override
    public Optional<ShippingOrder> findActiveByBorrowRecordId(UUID borrowRecordId) {
        List<ShippingOrder> results = entityManager.createQuery(
                        "SELECT s FROM ShippingOrder s WHERE s.borrowRecordId = :borrowId " +
                                "AND s.status NOT IN ('CANCELLED', 'FAILED', 'LOST', 'DELIVERED')",
                        ShippingOrder.class)
                .setParameter("borrowId", borrowRecordId)
                .setMaxResults(1)
                .getResultList();
        return results.isEmpty() ? Optional.empty() : Optional.of(results.get(0));
    }

    @Override
    public void updateStatus(UUID id, ShippingOrderStatus status, Instant timestampField) {
        entityManager.createQuery(
                        "UPDATE ShippingOrder s SET s.status = :status, s.updatedAt = :now WHERE s.id = :id")
                .setParameter("status", status)
                .setParameter("now", Instant.now())
                .setParameter("id", id)
                .executeUpdate();
    }

    @Override
    public List<ShippingOrder> findByStatusAndChangedSince(ShippingOrderStatus status, Instant since) {
        return entityManager.createQuery(
                        "SELECT s FROM ShippingOrder s WHERE s.status = :status AND s.updatedAt >= :since",
                        ShippingOrder.class)
                .setParameter("status", status)
                .setParameter("since", since)
                .getResultList();
    }

    public List<ShippingOrder> findByStatus(ShippingOrderStatus status) {
        return entityManager.createQuery(
                        "SELECT s FROM ShippingOrder s WHERE s.status = :status ORDER BY s.createdAt ASC",
                        ShippingOrder.class)
                .setParameter("status", status)
                .getResultList();
    }
}
