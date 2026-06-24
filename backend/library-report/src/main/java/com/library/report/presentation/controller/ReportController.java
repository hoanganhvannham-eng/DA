package com.library.report.presentation.controller;

import com.library.report.application.service.ReportExportService;
import com.library.report.application.service.ReportService;
import com.library.report.domain.dto.dashboard.DashboardDTO;
import com.library.report.domain.dto.report.DetailedReportDTO;
import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import com.library.report.presentation.dto.request.ExportCSVRequest;
import com.library.report.presentation.dto.response.ExportRequestDTO;
import com.library.report.presentation.dto.response.ExportStatusDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.InputStreamResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.time.LocalDate;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final ReportExportService reportExportService;

    @GetMapping("/dashboard")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<DashboardDTO> getDashboardOverview() {
        DashboardDTO dashboard = reportService.getDashboardOverview();
        return ResponseEntity.ok(dashboard);
    }

    @GetMapping("/{reportType}")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<DetailedReportDTO> getDetailedReport(
            @PathVariable ReportType reportType,
            @RequestParam(required = false) TimeRange timeRange) {
        DetailedReportDTO report = reportService.getDetailedReport(reportType, timeRange);
        return ResponseEntity.ok(report);
    }

    @PostMapping("/export")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ExportRequestDTO> requestExport(
            @Valid @RequestBody ExportCSVRequest request,
            Authentication authentication) {
        UUID userId = extractUserId(authentication);
        ExportRequestDTO result = reportService.requestExport(
                request.getReportType(), request.getTimeRange(), userId);
        return ResponseEntity.accepted().body(result);
    }

    @GetMapping("/export/{exportId}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ExportStatusDTO> getExportStatus(@PathVariable UUID exportId) {
        ExportStatusDTO status = reportService.getExportStatus(exportId);
        return ResponseEntity.ok(status);
    }

    @GetMapping("/export/{exportId}/download")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<Resource> downloadExport(@PathVariable UUID exportId) {
        InputStream inputStream = reportExportService.downloadExport(exportId);
        String filename = "report_" + LocalDate.now() + ".csv";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv; charset=UTF-8"))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + filename + "\"")
                .body(new InputStreamResource(inputStream));
    }

    @PostMapping("/export/{exportId}/retry")
    @PreAuthorize("hasAnyRole('ADMIN', 'LIBRARIAN')")
    public ResponseEntity<ExportRequestDTO> retryExport(@PathVariable UUID exportId) {
        ExportRequestDTO result = reportService.retryExport(exportId);
        return ResponseEntity.ok(result);
    }

    private UUID extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return null;
        }
        String name = authentication.getName();
        try {
            return UUID.fromString(name);
        } catch (IllegalArgumentException e) {
            return null;
        }
    }
}
