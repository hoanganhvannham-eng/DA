package com.library.common.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;

import java.time.Instant;
import java.util.List;

/**
 * Unified error response structure for all API errors.
 * Follows the API Spec §IV Unified Error Model.
 *
 * <p>Example:
 * <pre>{@code
 * {
 *   "status": 409,
 *   "code": "AUTH_DUPLICATE_EMAIL",
 *   "message": "Email đã được sử dụng",
 *   "traceId": "a1b2c3d4-...",
 *   "timestamp": "2026-05-09T09:16:03Z",
 *   "errors": null
 * }
 * }</pre>
 */
@Getter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiErrorResponse {

    private final int status;
    private final String code;
    private final String message;
    private final String traceId;
    private final Instant timestamp;

    /** Request URI that caused the error (SBP 07.03). */
    private final String path;

    /**
     * Field-level validation errors. Only present when code = VALIDATION_FAILED.
     */
    private final List<FieldErrorDto> errors;

    /**
     * Additional structured details for conflict errors (e.g., activeBorrowsCount).
     * Used by BOOK_INVENTORY_CONFLICT and BOOK_HAS_ACTIVE_BORROWS responses.
     */
    private final Object details;
}

