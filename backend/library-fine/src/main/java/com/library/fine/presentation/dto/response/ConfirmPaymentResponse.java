package com.library.fine.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.UUID;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ConfirmPaymentResponse {
    private String message;
    private FineInfo fine;

    @Getter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FineInfo {
        private UUID id;
        private String status;
        private Instant confirmedAt;
        private UUID confirmedBy;
    }
}
