package com.library.report.domain.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LostDamagedReportDTO {
    private List<LostDamagedRecord> records;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LostDamagedRecord {
        private String bookId;
        private String title;
        private String isbn;
        private String borrowId;
        private String bookCondition;
        private LocalDateTime returnedAt;
        private String readerName;
    }
}
