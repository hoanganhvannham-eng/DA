package com.library.report.presentation.dto.response;

import com.library.report.domain.enums.ExportRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportStatusDTO {
    private ExportRequestStatus status;
    private String downloadUrl;
    private String message;
}
