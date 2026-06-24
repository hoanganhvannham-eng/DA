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
public class FineStatsDTO {
    private double currentMonthTotal;
    private double currentMonthPaid;
    private double currentMonthUnpaid;
    private double currentMonthPending;
    private List<MonthlyFineTrend> last6MonthsTrend;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MonthlyFineTrend {
        private String month;
        private double total;
        private double paid;
    }
}
