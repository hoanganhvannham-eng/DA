package com.library.report.domain.dto.report;

import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DetailedReportDTO {
    private ReportType reportType;
    private TimeRange timeRange;
    private Object data;
    private int totalRecords;
    private String message;
}
