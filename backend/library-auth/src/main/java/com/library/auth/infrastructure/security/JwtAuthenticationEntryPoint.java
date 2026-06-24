package com.library.auth.infrastructure.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.library.common.constants.ErrorCode;
import com.library.common.dto.ApiErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    private static final String TRACE_ID_HEADER = "X-Trace-Id";
    private final ObjectMapper objectMapper;

    @Override
    public void commence(HttpServletRequest request,
                         HttpServletResponse response,
                         AuthenticationException authException) throws IOException {

        String traceId = UUID.randomUUID().toString().substring(0, 8);

        log.warn("Unauthorized access attempt [traceId={}]: {} {}",
                traceId, request.getMethod(), request.getRequestURI());

        ApiErrorResponse body = ApiErrorResponse.builder()
                .status(HttpStatus.UNAUTHORIZED.value())
                .code(ErrorCode.AUTH_UNAUTHORIZED.name())
                .message(ErrorCode.AUTH_UNAUTHORIZED.getMessage())
                .traceId(traceId)
                .timestamp(Instant.now())
                .path(request.getRequestURI())
                .build();

        response.setStatus(HttpStatus.UNAUTHORIZED.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.setHeader(TRACE_ID_HEADER, traceId);

        objectMapper.writeValue(response.getWriter(), body);
    }
}
