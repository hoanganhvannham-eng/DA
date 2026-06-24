package com.library.fine.infrastructure.persistence;

import com.library.fine.domain.entity.FineLevel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FineLevelRepository extends JpaRepository<FineLevel, UUID> {

    List<FineLevel> findAllByOrderByCreatedAtDesc();

    @Query("SELECT fl FROM FineLevel fl WHERE fl.fineType = :type OR fl.fineType = 'ALL' ORDER BY fl.createdAt DESC")
    List<FineLevel> findByFineTypeOrAll(@Param("type") String type);

    @Query("SELECT COUNT(ft) FROM FineTicket ft WHERE ft.fineLevelId = :fineLevelId")
    long countRefsByFineLevelId(@Param("fineLevelId") UUID fineLevelId);
}
