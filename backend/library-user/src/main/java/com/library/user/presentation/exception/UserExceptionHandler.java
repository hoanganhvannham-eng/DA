package com.library.user.presentation.exception;

import com.library.common.dto.ApiErrorResponse;
import com.library.common.constants.ErrorCode;
import com.library.user.domain.exception.InvalidRoleFilterException;
import com.library.user.domain.exception.InvalidStatusException;
import com.library.user.domain.exception.LastAdminException;
import com.library.user.domain.exception.SelfDeactivateException;
import com.library.user.domain.exception.SelfRoleChangeException;
import com.library.user.domain.exception.UserNotFoundException;
import com.fasterxml.jackson.databind.exc.InvalidFormatException;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class UserExceptionHandler {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ApiErrorResponse> handleUserNotFound(
            UserNotFoundException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_NOT_FOUND, httpRequest);
    }

    @ExceptionHandler(SelfDeactivateException.class)
    public ResponseEntity<ApiErrorResponse> handleSelfDeactivate(
            SelfDeactivateException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_SELF_DEACTIVATE_FORBIDDEN, httpRequest);
    }

    @ExceptionHandler(InvalidRoleFilterException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidRole(
            InvalidRoleFilterException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_ROLE_INVALID, httpRequest);
    }

    @ExceptionHandler(SelfRoleChangeException.class)
    public ResponseEntity<ApiErrorResponse> handleSelfRoleChange(
            SelfRoleChangeException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_SELF_ROLE_CHANGE_FORBIDDEN, httpRequest);
    }

    @ExceptionHandler(LastAdminException.class)
    public ResponseEntity<ApiErrorResponse> handleLastAdmin(
            LastAdminException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_LAST_ADMIN_VIOLATION, httpRequest);
    }

    @ExceptionHandler(InvalidFormatException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidFormat(
            InvalidFormatException ex, HttpServletRequest httpRequest) {
        if (ex.getTargetType() != null && ex.getTargetType().isEnum()) {
            return buildResponse(ErrorCode.USER_ROLE_INVALID, httpRequest);
        }
        return buildResponse(ErrorCode.VALIDATION_FAILED, httpRequest);
    }

    @ExceptionHandler(InvalidStatusException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidStatus(
            InvalidStatusException ex, HttpServletRequest httpRequest) {
        return buildResponse(ErrorCode.USER_STATUS_INVALID, httpRequest);
    }

    private ResponseEntity<ApiErrorResponse> buildResponse(ErrorCode errorCode, HttpServletRequest httpRequest) {
        String traceId = generateTraceId();

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(errorCode.getHttpStatus())
                .code(errorCode.name())
                .message(errorCode.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(httpRequest.getRequestURI())
                .build();

        log.warn("User management error [traceId={}]: {} — {}", traceId, errorCode.name(), httpRequest.getRequestURI());

        return ResponseEntity
                .status(errorCode.getHttpStatus())
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
