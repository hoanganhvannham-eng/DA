package com.library.report.domain.repository;

import com.library.report.domain.entity.ExportRequest;
import com.library.report.domain.enums.ExportRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ExportRequestRepository extends JpaRepository<ExportRequest, UUID> {

    @Query("SELECT e FROM ExportRequest e WHERE e.status = 'QUEUED' ORDER BY e.createdAt ASC")
    Optional<ExportRequest> findNextQueued();

    @Modifying
    @Query("UPDATE ExportRequest e SET e.status = :status, e.fileUrl = :fileUrl, "
            + "e.errorMessage = :errorMessage, e.completedAt = :completedAt WHERE e.id = :id")
    int updateStatus(@Param("id") UUID id, @Param("status") ExportRequestStatus status,
                     @Param("fileUrl") String fileUrl, @Param("errorMessage") String errorMessage,
                     @Param("completedAt") java.time.LocalDateTime completedAt);

    @Modifying
    @Query("UPDATE ExportRequest e SET e.status = 'QUEUED', e.errorMessage = NULL "
            + "WHERE e.id = :id AND e.status = 'FAILED'")
    int resetToQueued(@Param("id") UUID id);
}
