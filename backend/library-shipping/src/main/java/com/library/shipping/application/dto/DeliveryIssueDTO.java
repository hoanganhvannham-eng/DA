package com.library.shipping.application.dto;

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
public class DeliveryIssueDTO {

    private UUID id;
    private UUID readerId;
    private UUID bookId;
    private String status;
    private Integer deliveryAttemptCount;
    private String issueType;
    private String issueDescription;
    private String librarianNote;
    private Instant createdAt;
    private Instant updatedAt;
}
