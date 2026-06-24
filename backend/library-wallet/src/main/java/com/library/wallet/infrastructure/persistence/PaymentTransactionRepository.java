package com.library.wallet.infrastructure.persistence;

import com.library.wallet.domain.entity.PaymentTransaction;
import com.library.wallet.domain.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface PaymentTransactionRepository extends JpaRepository<PaymentTransaction, UUID> {

    Optional<PaymentTransaction> findByPaymentCode(String paymentCode);

    @Query("SELECT pt FROM PaymentTransaction pt WHERE pt.status = :status AND pt.expiredAt < :now")
    List<PaymentTransaction> findByStatusAndExpiredAtBefore(
            @Param("status") PaymentStatus status,
            @Param("now") Instant now);
}
