package com.library.bookreturn.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveReturnLostResponse {

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
        private String returnLostResolution;
        private String investigationNote;
        private java.time.Instant returnedAt;
    }
}
