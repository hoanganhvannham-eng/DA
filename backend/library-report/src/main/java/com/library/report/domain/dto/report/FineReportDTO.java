package com.library.report.domain.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineReportDTO {
    private double totalRevenue;
    private List<DebtorInfo> debtors;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DebtorInfo {
        private String readerId;
        private String readerName;
        private double totalOwed;
        private int ticketCount;
    }
}
