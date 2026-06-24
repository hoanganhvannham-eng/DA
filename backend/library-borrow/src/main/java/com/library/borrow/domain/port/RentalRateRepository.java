package com.library.borrow.domain.port;

import com.library.borrow.domain.entity.RentalRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface RentalRateRepository extends JpaRepository<RentalRate, UUID> {
    @Query("SELECT r FROM RentalRate r WHERE r.minDays <= :durationDays AND r.maxDays >= :durationDays AND r.isActive = true")
    Optional<RentalRate> findByDurationDays(@Param("durationDays") Integer durationDays);

    List<RentalRate> findByIsActiveTrue();
}
