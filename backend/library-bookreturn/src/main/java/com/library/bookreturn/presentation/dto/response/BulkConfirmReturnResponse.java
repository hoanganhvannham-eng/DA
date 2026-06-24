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
public class BulkConfirmReturnResponse {

    private String message;
    private int totalRequested;
    private int totalSuccess;
    private int totalFailed;
    private List<BulkConfirmResult> results;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BulkConfirmResult {
        private UUID borrowId;
        private boolean success;
        private String message;
    }
}
