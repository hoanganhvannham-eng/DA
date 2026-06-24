package com.library.bookreturn.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateReturnResponse {

    private String message;

    private BorrowRecordDto borrowRecord;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BorrowRecordDto {
        private UUID id;
        private String status;
        private String returnMethod;
        private String pickupAddress;
        private Instant updatedAt;
    }
}
