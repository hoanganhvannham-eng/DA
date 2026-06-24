package com.library.book.infrastructure.persistence;

import com.library.book.domain.entity.DepositPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookDepositPolicyRepository extends JpaRepository<DepositPolicy, UUID> {
    Optional<DepositPolicy> findByIdAndIsActiveTrue(UUID id);
}
