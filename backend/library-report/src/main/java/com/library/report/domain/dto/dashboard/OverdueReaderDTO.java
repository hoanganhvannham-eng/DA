package com.library.report.domain.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OverdueReaderDTO {
    private UUID readerId;
    private String readerName;
    private int overdueCount;
    private int maxOverdueDays;
}
