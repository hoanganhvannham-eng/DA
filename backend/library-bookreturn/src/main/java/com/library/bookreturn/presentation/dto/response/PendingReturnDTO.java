package com.library.bookreturn.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PendingReturnDTO {

    private UUID id;
    private UUID readerId;
    private String readerName;
    private UUID bookId;
    private String bookTitle;
    private String status;
    private String returnMethod;
    private String pickupAddress;
    private Instant dueDate;
    private Instant updatedAt;
    private BigDecimal replacementPriceSnapshot;
}
