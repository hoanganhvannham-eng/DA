package com.library.auth.presentation.exception;

import com.library.auth.domain.exception.account.AccountLockedException;
import com.library.common.constants.ErrorCode;
import com.library.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class AuthExceptionHandler {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private static final String RETRY_AFTER_HEADER = "Retry-After";

    @ExceptionHandler(AccountLockedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccountLockedException(
            AccountLockedException ex,
            HttpServletRequest httpRequest) {

        String traceId = generateTraceId();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.TOO_MANY_REQUESTS.value())
                .code(ex.getErrorCode().name())
                .message(ex.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI())
                .build();

        log.warn("Account locked [traceId={}]: retryAfter={}s — {}",
                traceId, ex.getRetryAfterSeconds(), httpRequest.getRequestURI());

        return ResponseEntity
                .status(HttpStatus.TOO_MANY_REQUESTS)
                .header(TRACE_ID_HEADER, traceId)
                .header(RETRY_AFTER_HEADER, String.valueOf(ex.getRetryAfterSeconds()))
                .body(body);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiErrorResponse> handleAccessDenied(AccessDeniedException ex,
                                                                HttpServletRequest httpRequest) {

        String traceId = generateTraceId();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.FORBIDDEN.value())
                .code(ErrorCode.AUTH_UNAUTHORIZED.name())
                .message("Bạn không có quyền truy cập chức năng này")
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI())
                .build();

        log.warn("Access denied [traceId={}]: {} {} — {}", traceId,
                httpRequest.getMethod(), httpRequest.getRequestURI(), ex.getMessage());

        return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .header(TRACE_ID_HEADER, traceId)
                .body(body);
    }

    private String generateTraceId() {
        String mdcTraceId = MDC.get("traceId");
        return (mdcTraceId != null && !mdcTraceId.isBlank())
                ? mdcTraceId
                : UUID.randomUUID().toString().substring(0, 8);
    }
}
