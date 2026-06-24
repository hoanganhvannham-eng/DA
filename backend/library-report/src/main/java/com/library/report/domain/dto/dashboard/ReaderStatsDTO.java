package com.library.report.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReaderStatsDTO {
    private int totalActive;
    private int totalDisabled;
}
