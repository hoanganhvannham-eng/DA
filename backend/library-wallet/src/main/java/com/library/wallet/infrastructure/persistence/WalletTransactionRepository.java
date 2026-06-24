package com.library.wallet.infrastructure.persistence;

import com.library.wallet.domain.entity.WalletTransaction;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, UUID> {

    @Query("SELECT wt FROM WalletTransaction wt WHERE wt.wallet.userId = :userId ORDER BY wt.createdAt DESC")
    Page<WalletTransaction> findByUserId(@Param("userId") UUID userId, Pageable pageable);
}
