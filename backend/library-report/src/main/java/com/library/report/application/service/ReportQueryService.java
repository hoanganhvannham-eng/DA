package com.library.report.application.service;

import com.library.report.domain.dto.dashboard.BookStatsDTO;
import com.library.report.domain.dto.dashboard.FineStatsDTO;
import com.library.report.domain.dto.dashboard.OverdueReaderDTO;
import com.library.report.domain.dto.dashboard.ReaderStatsDTO;
import com.library.report.domain.dto.dashboard.TopBookDTO;
import com.library.report.domain.dto.report.BookReportDTO;
import com.library.report.domain.dto.report.BookReportDTO.CategoryStats;
import com.library.report.domain.dto.report.BorrowReturnReportDTO;
import com.library.report.domain.dto.report.BorrowReturnReportDTO.TimeBucket;
import com.library.report.domain.dto.report.FineReportDTO;
import com.library.report.domain.dto.report.FineReportDTO.DebtorInfo;
import com.library.report.domain.dto.report.LostDamagedReportDTO;
import com.library.report.domain.dto.report.LostDamagedReportDTO.LostDamagedRecord;
import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import com.library.report.domain.repository.ReportQueryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

@Service
@RequiredArgsConstructor
public class ReportQueryService {

    private final ReportQueryRepository reportQueryRepository;

    @Async("reportTaskExecutor")
    public CompletableFuture<BookStatsDTO> getBookStats() {
        return CompletableFuture.completedFuture(reportQueryRepository.queryBookStats());
    }

    @Async("reportTaskExecutor")
    public CompletableFuture<ReaderStatsDTO> getReaderStats() {
        return CompletableFuture.completedFuture(reportQueryRepository.queryReaderStats());
    }

    @Async("reportTaskExecutor")
    public CompletableFuture<Integer> getTodayBorrowCount() {
        return CompletableFuture.completedFuture(reportQueryRepository.queryTodayBorrowCount());
    }

    @Async("reportTaskExecutor")
    public CompletableFuture<List<TopBookDTO>> getTopBooks(int limit) {
        return CompletableFuture.completedFuture(reportQueryRepository.queryTopBooks(limit));
    }

    @Async("reportTaskExecutor")
    public CompletableFuture<List<OverdueReaderDTO>> getOverdueReaders() {
        return CompletableFuture.completedFuture(reportQueryRepository.queryOverdueReaders());
    }

    @Async("reportTaskExecutor")
    public CompletableFuture<FineStatsDTO> getFineStats() {
        return CompletableFuture.completedFuture(reportQueryRepository.queryFineStats());
    }

    // ========== UC25: Detailed report queries ==========

    public BookReportDTO aggregateBookReport(TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        List<CategoryStats> categories = reportQueryRepository.queryBookReport(range[0], range[1]);
        return BookReportDTO.builder().categories(categories).build();
    }

    public BorrowReturnReportDTO aggregateBorrowReturnReport(TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        String period = timeRange != null ? timeRange.name() : "DAY";
        List<TimeBucket> buckets = reportQueryRepository.queryBorrowReturnReport(period, range[0], range[1]);
        return BorrowReturnReportDTO.builder().timeBuckets(buckets).build();
    }

    public FineReportDTO aggregateFineReport(TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        Double revenue = reportQueryRepository.queryFineRevenue(range[0], range[1]);
        List<DebtorInfo> debtors = reportQueryRepository.queryFineDebtors();
        return FineReportDTO.builder()
                .totalRevenue(revenue != null ? revenue : 0.0)
                .debtors(debtors != null ? debtors : List.of())
                .build();
    }

    public LostDamagedReportDTO aggregateLostDamagedReport(TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        List<LostDamagedRecord> records = reportQueryRepository.queryLostDamagedReport(range[0], range[1]);
        return LostDamagedReportDTO.builder()
                .records(records != null ? records : List.of())
                .build();
    }

    public int countRecords(ReportType reportType, TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        return reportQueryRepository.countRecords(reportType.name(), range[0], range[1]);
    }

    public List<Map<String, Object>> fetchFullDataset(ReportType reportType, TimeRange timeRange) {
        LocalDateTime[] range = calculateTimeRange(timeRange);
        return reportQueryRepository.fetchFullDataset(reportType.name(), range[0], range[1]);
    }

    private LocalDateTime[] calculateTimeRange(TimeRange timeRange) {
        if (timeRange == null) {
            return new LocalDateTime[]{null, null};
        }
        LocalDateTime end = LocalDateTime.now();
        LocalDateTime start;
        switch (timeRange) {
            case DAY: start = end.minusDays(1); break;
            case WEEK: start = end.minusWeeks(1); break;
            case MONTH: start = end.minusMonths(1); break;
            case QUARTER: start = end.minusMonths(3); break;
            case YEAR: start = end.minusYears(1); break;
            default: return new LocalDateTime[]{null, null};
        }
        return new LocalDateTime[]{start, end};
    }
}
