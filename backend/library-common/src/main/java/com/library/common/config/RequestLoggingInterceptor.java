package com.library.common.config;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.ModelAndView;

/**
 * Spring MVC interceptor that logs every HTTP request and its response.
 *
 * <p>Log format per request:
 * <pre>
 * --> POST /api/v1/auth/register [127.0.0.1]
 * <-- 201 POST /api/v1/auth/register (87ms)
 * </pre>
 *
 * <p>Designed to be lightweight for dev/thesis use:
 * <ul>
 *   <li>Uses WARN for 4xx/5xx, INFO for 2xx/3xx</li>
 *   <li>Skips health/actuator endpoints</li>
 *   <li>Timing tracked via request attribute</li>
 * </ul>
 *
 * @see WebMvcConfig register this interceptor
 */
@Slf4j
@Component
public class RequestLoggingInterceptor implements HandlerInterceptor {

    private static final String START_TIME_ATTR = "requestStartTime";

    @Override
    public boolean preHandle(HttpServletRequest request,
                             HttpServletResponse response,
                             Object handler) {
        request.setAttribute(START_TIME_ATTR, System.currentTimeMillis());

        String clientIp = getClientIp(request);
        log.info("--> {} {} [{}]", request.getMethod(), request.getRequestURI(), clientIp);
        return true;
    }

    @Override
    public void postHandle(HttpServletRequest request,
                           HttpServletResponse response,
                           Object handler,
                           ModelAndView modelAndView) {
        // No-op: log at afterCompletion when status is available
    }

    @Override
    public void afterCompletion(HttpServletRequest request,
                                HttpServletResponse response,
                                Object handler,
                                Exception ex) {
        long startTime = (Long) request.getAttribute(START_TIME_ATTR);
        long elapsed = System.currentTimeMillis() - startTime;
        int status = response.getStatus();

        String logLine = String.format("<-- %d %s %s (%dms)",
                status, request.getMethod(), request.getRequestURI(), elapsed);

        if (status >= 500) {
            log.error(logLine);
        } else if (status >= 400) {
            log.warn(logLine);
        } else {
            log.info(logLine);
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
