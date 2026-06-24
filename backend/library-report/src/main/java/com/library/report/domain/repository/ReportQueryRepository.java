package com.library.report.domain.repository;

import com.library.report.domain.dto.dashboard.BookStatsDTO;
import com.library.report.domain.dto.dashboard.FineStatsDTO;
import com.library.report.domain.dto.dashboard.OverdueReaderDTO;
import com.library.report.domain.dto.dashboard.ReaderStatsDTO;
import com.library.report.domain.dto.dashboard.TopBookDTO;
import com.library.report.domain.dto.report.BookReportDTO.CategoryStats;
import com.library.report.domain.dto.report.BorrowReturnReportDTO.TimeBucket;
import com.library.report.domain.dto.report.FineReportDTO.DebtorInfo;
import com.library.report.domain.dto.report.LostDamagedReportDTO.LostDamagedRecord;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

public interface ReportQueryRepository {
    BookStatsDTO queryBookStats();
    ReaderStatsDTO queryReaderStats();
    int queryTodayBorrowCount();
    List<TopBookDTO> queryTopBooks(int limit);
    List<OverdueReaderDTO> queryOverdueReaders();
    FineStatsDTO queryFineStats();

    // UC25: Detailed report queries
    List<CategoryStats> queryBookReport(LocalDateTime timeStart, LocalDateTime timeEnd);
    List<TimeBucket> queryBorrowReturnReport(String period, LocalDateTime timeStart, LocalDateTime timeEnd);
    Double queryFineRevenue(LocalDateTime timeStart, LocalDateTime timeEnd);
    List<DebtorInfo> queryFineDebtors();
    List<LostDamagedRecord> queryLostDamagedReport(LocalDateTime timeStart, LocalDateTime timeEnd);
    int countRecords(String reportType, LocalDateTime timeStart, LocalDateTime timeEnd);
    List<Map<String, Object>> fetchFullDataset(String reportType, LocalDateTime timeStart, LocalDateTime timeEnd);
}
