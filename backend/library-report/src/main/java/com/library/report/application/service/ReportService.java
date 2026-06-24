package com.library.report.application.service;

import com.library.report.domain.dto.dashboard.BookStatsDTO;
import com.library.report.domain.dto.dashboard.DashboardDTO;
import com.library.report.domain.dto.dashboard.FineStatsDTO;
import com.library.report.domain.exception.EmptyDatasetException;
import com.library.report.domain.exception.ExportRequestNotFoundException;
import com.library.report.domain.exception.ExportRetryNotAllowedException;
import com.library.report.domain.dto.dashboard.OverdueReaderDTO;
import com.library.report.domain.dto.dashboard.ReaderStatsDTO;
import com.library.report.domain.dto.dashboard.TopBookDTO;
import com.library.report.domain.dto.report.BookReportDTO;
import com.library.report.domain.dto.report.BorrowReturnReportDTO;
import com.library.report.domain.dto.report.DetailedReportDTO;
import com.library.report.domain.dto.report.FineReportDTO;
import com.library.report.domain.dto.report.LostDamagedReportDTO;
import com.library.report.domain.entity.ExportRequest;
import com.library.report.domain.enums.ExportRequestStatus;
import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import com.library.report.domain.repository.ExportRequestRepository;
import com.library.report.presentation.dto.response.ExportRequestDTO;
import com.library.report.presentation.dto.response.ExportStatusDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final ReportQueryService reportQueryService;
    private final ExportRequestRepository exportRequestRepository;

    public DashboardDTO getDashboardOverview() {
        CompletableFuture<BookStatsDTO> bookStatsFuture = reportQueryService.getBookStats();
        CompletableFuture<ReaderStatsDTO> readerStatsFuture = reportQueryService.getReaderStats();
        CompletableFuture<Integer> todayBorrowsFuture = reportQueryService.getTodayBorrowCount();
        CompletableFuture<List<TopBookDTO>> topBooksFuture = reportQueryService.getTopBooks(5);
        CompletableFuture<List<OverdueReaderDTO>> overdueReadersFuture = reportQueryService.getOverdueReaders();
        CompletableFuture<FineStatsDTO> fineStatsFuture = reportQueryService.getFineStats();

        CompletableFuture.allOf(bookStatsFuture, readerStatsFuture, todayBorrowsFuture,
                topBooksFuture, overdueReadersFuture, fineStatsFuture).join();

        BookStatsDTO bookStats = bookStatsFuture.join();
        ReaderStatsDTO readerStats = readerStatsFuture.join();
        int todayBorrows = todayBorrowsFuture.join();
        List<TopBookDTO> topBooks = topBooksFuture.join();
        List<OverdueReaderDTO> overdueReaders = overdueReadersFuture.join();
        FineStatsDTO fineStats = fineStatsFuture.join();

        List<String> emptySections = new ArrayList<>();
        if (topBooks == null || topBooks.isEmpty()) {
            emptySections.add("top_books");
        }
        if (overdueReaders == null || overdueReaders.isEmpty()) {
            emptySections.add("overdue_readers");
        }
        if (todayBorrows == 0) {
            emptySections.add("today_borrows");
        }
        if (bookStats.getTotalAvailable() == 0 && bookStats.getTotalBorrowed() == 0
                && bookStats.getTotalLost() == 0 && bookStats.getTotalDamaged() == 0) {
            emptySections.add("book_stats");
        }
        if (readerStats.getTotalActive() == 0 && readerStats.getTotalDisabled() == 0) {
            emptySections.add("reader_stats");
        }
        if (fineStats.getCurrentMonthTotal() == 0
                && (fineStats.getLast6MonthsTrend() == null || fineStats.getLast6MonthsTrend().isEmpty())) {
            emptySections.add("fine_stats");
        }

        DashboardDTO dto = DashboardDTO.builder()
                .bookStats(bookStats)
                .readerStats(readerStats)
                .todayBorrows(todayBorrows)
                .topBooks(topBooks != null ? topBooks : new ArrayList<>())
                .overdueReaders(overdueReaders != null ? overdueReaders : new ArrayList<>())
                .fineStats(fineStats)
                .emptySections(emptySections)
                .build();

        log.debug("Dashboard assembled: emptySections={}", emptySections);
        return dto;
    }

    // ========== UC25: Detailed report ==========

    public DetailedReportDTO getDetailedReport(ReportType reportType, TimeRange timeRange) {
        Object data;
        int totalRecords;

        switch (reportType) {
            case BOOK:
                BookReportDTO bookReport = reportQueryService.aggregateBookReport(timeRange);
                data = bookReport;
                totalRecords = bookReport.getCategories() != null ? bookReport.getCategories().size() : 0;
                break;
            case BORROW_RETURN:
                BorrowReturnReportDTO borrowReturnReport = reportQueryService.aggregateBorrowReturnReport(timeRange);
                data = borrowReturnReport;
                totalRecords = borrowReturnReport.getTimeBuckets() != null
                        ? borrowReturnReport.getTimeBuckets().size() : 0;
                break;
            case FINE:
                FineReportDTO fineReport = reportQueryService.aggregateFineReport(timeRange);
                data = fineReport;
                totalRecords = fineReport.getDebtors() != null ? fineReport.getDebtors().size() : 0;
                break;
            case LOST_DAMAGED:
                LostDamagedReportDTO lostDamagedReport = reportQueryService.aggregateLostDamagedReport(timeRange);
                data = lostDamagedReport;
                totalRecords = lostDamagedReport.getRecords() != null
                        ? lostDamagedReport.getRecords().size() : 0;
                break;
            default:
                data = null;
                totalRecords = 0;
        }

        String message = null;
        if (totalRecords == 0) {
            message = "Không có dữ liệu trong khoảng thời gian này";
        }

        return DetailedReportDTO.builder()
                .reportType(reportType)
                .timeRange(timeRange)
                .data(data)
                .totalRecords(totalRecords)
                .message(message)
                .build();
    }

    @Transactional
    public ExportRequestDTO requestExport(ReportType reportType, TimeRange timeRange, UUID userId) {
        int recordCount = reportQueryService.countRecords(reportType, timeRange);
        if (recordCount == 0) {
            throw new EmptyDatasetException("Không có dữ liệu để xuất");
        }

        ExportRequest exportRequest = new ExportRequest();
        exportRequest.setReportType(reportType);
        exportRequest.setTimeRange(timeRange);
        exportRequest.setRequestedBy(userId);
        exportRequest.setStatus(ExportRequestStatus.QUEUED);
        exportRequest.setCreatedAt(LocalDateTime.now());
        exportRequest.setUpdatedAt(LocalDateTime.now());

        exportRequest = exportRequestRepository.save(exportRequest);

        return ExportRequestDTO.builder()
                .exportId(exportRequest.getId())
                .status(ExportRequestStatus.QUEUED)
                .message("Đang tạo file CSV. Vui lòng đợi...")
                .build();
    }

    public ExportStatusDTO getExportStatus(UUID exportId) {
        ExportRequest exportRequest = exportRequestRepository.findById(exportId)
                .orElseThrow(() -> new ExportRequestNotFoundException("Yêu cầu xuất báo cáo không tồn tại"));

        String downloadUrl = null;
        if (exportRequest.getStatus() == ExportRequestStatus.READY) {
            downloadUrl = "/api/reports/export/" + exportId + "/download";
        }

        String message = null;
        if (exportRequest.getStatus() == ExportRequestStatus.FAILED) {
            message = exportRequest.getErrorMessage() != null
                    ? "Xuất báo thất bại: " + exportRequest.getErrorMessage()
                    : "Xuất báo cáo thất bại";
        }

        return ExportStatusDTO.builder()
                .status(exportRequest.getStatus())
                .downloadUrl(downloadUrl)
                .message(message)
                .build();
    }

    @Transactional
    public ExportRequestDTO retryExport(UUID exportId) {
        int updated = exportRequestRepository.resetToQueued(exportId);
        if (updated == 0) {
            ExportRequest exportRequest = exportRequestRepository.findById(exportId)
                    .orElseThrow(() -> new ExportRequestNotFoundException("Yêu cầu xuất báo cáo không tồn tại"));
            if (exportRequest.getStatus() != ExportRequestStatus.FAILED) {
                throw new ExportRetryNotAllowedException("Chỉ có thể thử lại khi xuất báo cáo thất bại");
            }
        }

        return ExportRequestDTO.builder()
                .exportId(exportId)
                .status(ExportRequestStatus.QUEUED)
                .message("Đã thêm lại vào hàng đợi")
                .build();
    }
}
