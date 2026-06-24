package com.library.report.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BookStatsDTO {
    private int totalAvailable;
    private int totalBorrowed;
    private int totalLost;
    private int totalDamaged;
}
