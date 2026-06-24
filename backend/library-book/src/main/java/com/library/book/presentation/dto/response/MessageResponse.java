package com.library.book.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class MessageResponse {

    private final String message;
    private final String traceId;
}
