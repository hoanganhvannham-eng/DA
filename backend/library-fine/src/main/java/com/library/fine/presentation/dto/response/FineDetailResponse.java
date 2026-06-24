package com.library.fine.presentation.dto.response;

import com.library.fine.presentation.dto.FineTicketDetailDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FineDetailResponse {
    private FineTicketDetailDTO fine;
}
