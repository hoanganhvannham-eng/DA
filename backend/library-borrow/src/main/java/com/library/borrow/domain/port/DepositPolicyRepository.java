package com.library.borrow.domain.port;

import com.library.book.domain.entity.DepositPolicy;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DepositPolicyRepository extends JpaRepository<DepositPolicy, UUID> {
    List<DepositPolicy> findByIsActiveTrue();
}
