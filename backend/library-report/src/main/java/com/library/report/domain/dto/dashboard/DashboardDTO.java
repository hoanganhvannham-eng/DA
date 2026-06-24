package com.library.report.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private BookStatsDTO bookStats;
    private ReaderStatsDTO readerStats;
    private int todayBorrows;
    private List<TopBookDTO> topBooks;
    private List<OverdueReaderDTO> overdueReaders;
    private FineStatsDTO fineStats;
    private List<String> emptySections;
}
