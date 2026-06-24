package com.library.report.presentation.dto.request;

import com.library.report.domain.enums.ReportType;
import com.library.report.domain.enums.TimeRange;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ExportCSVRequest {

    @NotNull(message = "Loại báo cáo không được để trống")
    private ReportType reportType;

    private TimeRange timeRange;
}
