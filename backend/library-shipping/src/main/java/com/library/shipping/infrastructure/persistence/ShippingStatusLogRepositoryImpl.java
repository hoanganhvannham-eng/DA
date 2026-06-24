package com.library.shipping.infrastructure.persistence;

import com.library.shipping.domain.entity.ShippingStatusLog;
import com.library.shipping.domain.port.ShippingStatusLogRepository;
import jakarta.persistence.EntityManager;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ShippingStatusLogRepositoryImpl implements ShippingStatusLogRepository {

    private final EntityManager entityManager;

    @Override
    public ShippingStatusLog save(ShippingStatusLog log) {
        if (log.getId() == null) {
            entityManager.persist(log);
            return log;
        }
        return entityManager.merge(log);
    }
}
