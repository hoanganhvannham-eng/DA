package com.library.bookreturn.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmReturnResponse {

    private String message;

    private BorrowRecordDto borrowRecord;

    private List<FineTicketDTO> finesCreated;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorrowRecordDto {
        private UUID id;
        private String status;
        private String bookCondition;
        private Instant returnedAt;
        private UUID confirmedBy;
        private Instant confirmedAt;
    }
}
