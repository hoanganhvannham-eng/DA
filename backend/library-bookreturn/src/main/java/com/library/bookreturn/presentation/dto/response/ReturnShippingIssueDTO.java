package com.library.bookreturn.presentation.dto.response;

import com.library.borrow.domain.enums.BorrowStatus;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;
import java.util.UUID;

@Getter
@Setter
public class ReturnShippingIssueDTO {

    private UUID borrowId;
    private UUID readerId;
    private String readerName;
    private UUID bookId;
    private String bookTitle;
    private String returnMethod;
    private Instant borrowDate;
    private Instant dueDate;
    private String pickupAddress;
    private BorrowStatus status;
    private Integer returnAttemptCount;
    private String returnLostResolution;
    private String investigationNote;
    private Instant updatedAt;
}
