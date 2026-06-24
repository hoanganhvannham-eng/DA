package com.library.common.exception;

import com.library.common.constants.ErrorCode;
import com.library.common.dto.ApiErrorResponse;
import com.library.common.dto.FieldErrorDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

/**
 * Global exception handler for the entire application.
 * Converts exceptions into the unified {@link ApiErrorResponse} format.
 *
 * <p>Every response includes:
 * <ul>
 *   <li>{@code X-Trace-Id} header for request tracing</li>
 *   <li>{@code path} field indicating which endpoint caused the error (SBP 07.03)</li>
 * </ul>
 *
 * <p>Note: {@code AccountLockedException} (429) is handled in
 * {@code AuthExceptionHandler} (library-auth) to avoid circular dependency.
 */
@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    /**
     * Handles Bean Validation failures (e.g., @Valid on request body).
     * Returns 400 with field-level error details.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex,
            HttpServletRequest httpRequest) {

        String traceId = generateTraceId();

        List<FieldErrorDto> fieldErrors = ex.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(fe -> new FieldErrorDto(fe.getField(), fe.getDefaultMessage()))
                .toList();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .code(ErrorCode.VALIDATION_FAILED.name())
                .message(ErrorCode.VALIDATION_FAILED.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI()) // fix SBP 07.03
                .errors(fieldErrors)
                .build();

        log.warn("Validation failed [traceId={}]: {} field error(s)", traceId, fieldErrors.size());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .header(TRACE_ID_HEADER, traceId)
                .body(body);
    }

    /**
     * Handles all business-rule violations thrown by services.
     * HTTP status is derived from the exception's {@link ErrorCode}.
     */
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ApiErrorResponse> handleBusinessException(BusinessException ex,
                                                                    HttpServletRequest httpRequest) {

        String traceId = generateTraceId();
        ErrorCode errorCode = ex.getErrorCode();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(errorCode.getHttpStatus())
                .code(errorCode.name())
                .message(ex.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI()) // fix SBP 07.03
                .details(ex.getDetails())
                .build();

        log.warn("Business exception [traceId={}]: {} — {}", traceId, errorCode.name(), ex.getMessage());

        return ResponseEntity
                .status(errorCode.getHttpStatus())
                .header(TRACE_ID_HEADER, traceId)
                .body(body);
    }

    /**
     * Handles illegal argument errors (e.g. invalid enum, missing required input).
     * Returns 400 — these are client mistakes, not server failures.
     */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiErrorResponse> handleIllegalArgument(IllegalArgumentException ex,
                                                                   HttpServletRequest httpRequest) {

        String traceId = generateTraceId();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.BAD_REQUEST.value())
                .code(ErrorCode.VALIDATION_FAILED.name())
                .message(ex.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI())
                .build();

        log.warn("Illegal argument [traceId={}]: {}", traceId, ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .header(TRACE_ID_HEADER, traceId)
                .body(body);
    }

    /**
     * Catch-all for unexpected errors. Returns 500.
     */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleGenericException(Exception ex,
                                                                     HttpServletRequest httpRequest) {

        String traceId = generateTraceId();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.INTERNAL_SERVER_ERROR.value())
                .code(ErrorCode.SYSTEM_ERROR.name())
                .message(ErrorCode.SYSTEM_ERROR.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI()) // fix SBP 07.03
                .build();

        log.error("Unexpected error [traceId={}]: {}", traceId, ex.getMessage(), ex);

        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .header(TRACE_ID_HEADER, traceId)
                .body(body);
    }

    private String generateTraceId() {
        // Prefer the traceId already set by MdcTraceFilter so logs and
        // error responses share the same identifier.
        String mdcTraceId = MDC.get("traceId");
        return (mdcTraceId != null && !mdcTraceId.isBlank())
                ? mdcTraceId
                : UUID.randomUUID().toString().substring(0, 8);
    }
}
