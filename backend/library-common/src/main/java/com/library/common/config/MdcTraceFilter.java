package com.library.common.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.slf4j.MDC;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

/**
 * Servlet filter that injects a unique traceId into the MDC context
 * for every incoming HTTP request.
 *
 * <p>The traceId is:
 * <ul>
 *   <li>Taken from the incoming {@code X-Trace-Id} header if present</li>
 *   <li>Generated as a short UUID otherwise</li>
 *   <li>Added to the response as {@code X-Trace-Id} header</li>
 *   <li>Cleared from MDC after the request completes (prevent memory leak)</li>
 * </ul>
 *
 * <p>All log statements within the request thread will automatically
 * include the traceId via the logback pattern {@code %X{traceId}}.
 */
@Slf4j
@Component
@Order(1)
public class MdcTraceFilter extends OncePerRequestFilter {

    private static final String TRACE_ID_KEY = "traceId";
    private static final String TRACE_ID_HEADER = "X-Trace-Id";

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {

        String traceId = resolveTraceId(request);

        try {
            MDC.put(TRACE_ID_KEY, traceId);
            response.setHeader(TRACE_ID_HEADER, traceId);
            filterChain.doFilter(request, response);
        } finally {
            // Must clear MDC to prevent leaking into thread pool threads
            MDC.clear();
        }
    }

    private String resolveTraceId(HttpServletRequest request) {
        String incoming = request.getHeader(TRACE_ID_HEADER);
        if (incoming != null && !incoming.isBlank()) {
            return incoming;
        }
        // Short format: 8 chars — enough for dev, easy to read in logs
        return UUID.randomUUID().toString().substring(0, 8);
    }
}
