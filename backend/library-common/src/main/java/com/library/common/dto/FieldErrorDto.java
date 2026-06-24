package com.library.common.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

/**
 * Represents a single field-level validation error.
 * Used within {@link ApiErrorResponse#getErrors()} for VALIDATION_FAILED responses.
 */
@Getter
@AllArgsConstructor
public class FieldErrorDto {

    private final String field;
    private final String message;
}
