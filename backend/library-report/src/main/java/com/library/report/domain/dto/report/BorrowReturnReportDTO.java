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
public class BorrowReturnReportDTO {
    private List<TimeBucket> timeBuckets;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TimeBucket {
        private String period;
        private int borrows;
        private int returns;
    }
}
