package com.library.report.presentation.dto.response;

import com.library.report.domain.enums.ExportRequestStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExportRequestDTO {
    private UUID exportId;
    private ExportRequestStatus status;
    private String message;
}
