package com.library.bookreturn.presentation.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ReturnShippingRequestedDTO {

    private UUID borrowId;
    private UUID readerId;
    private String readerName;
    private UUID bookId;
    private String bookTitle;
    private String returnMethod;
    private Instant borrowDate;
    private Instant dueDate;
    private String pickupAddress;
    private Integer returnAttemptCount;
    private Instant createdAt;
}
