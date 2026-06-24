package com.library.report.application.service;

import com.library.report.domain.enums.ExportRequestStatus;
import com.library.report.domain.entity.ExportRequest;
import com.library.report.domain.exception.ExportNotReadyException;
import com.library.report.domain.exception.ExportRequestNotFoundException;
import com.library.report.domain.repository.ExportRequestRepository;
import com.library.report.infrastructure.external.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReportExportService {

    private final ExportRequestRepository exportRequestRepository;
    private final FileStorageService fileStorageService;

    public InputStream downloadExport(UUID exportId) {
        ExportRequest exportRequest = exportRequestRepository.findById(exportId)
                .orElseThrow(() -> new ExportRequestNotFoundException("Yêu cầu xuất báo cáo không tồn tại"));

        if (exportRequest.getStatus() != ExportRequestStatus.READY) {
            throw new ExportNotReadyException(
                    "File CSV chưa sẵn sàng. Vui lòng đợi xử lý xong");
        }

        return fileStorageService.getFile(exportRequest.getFileUrl());
    }
}
