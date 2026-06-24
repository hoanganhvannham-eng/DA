package com.library.auth.infrastructure.config;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import io.github.bucket4j.Refill;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final int REGISTER_CAPACITY = 5;
    private static final int RESEND_CAPACITY = 3;
    private static final int SHIPPING_SHIPMENT_CAPACITY = 10;
    private static final int SHIPPING_ISSUE_CAPACITY = 10;
    private static final int SHIPPING_LIST_CAPACITY = 30;
    private static final Duration WINDOW = Duration.ofMinutes(1);

    private final Map<String, Bucket> registerBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> resendBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> shippingShipmentBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> shippingIssueBuckets = new ConcurrentHashMap<>();
    private final Map<String, Bucket> shippingListBuckets = new ConcurrentHashMap<>();

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain)
            throws ServletException, IOException {

        String path = request.getRequestURI();
        String ip = resolveClientIp(request);

        if (path.startsWith("/api/v1/auth/register")) {
            if (!tryConsume(registerBuckets, ip, REGISTER_CAPACITY)) {
                sendRateLimitResponse(response, ip, path);
                return;
            }
        } else if (path.startsWith("/api/v1/auth/resend-verification")) {
            if (!tryConsume(resendBuckets, ip, RESEND_CAPACITY)) {
                sendRateLimitResponse(response, ip, path);
                return;
            }
        } else if (path.matches("/api/v1/borrows/[^/]+/shipments") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (!tryConsume(shippingShipmentBuckets, ip, SHIPPING_SHIPMENT_CAPACITY)) {
                sendRateLimitResponse(response, ip, path);
                return;
            }
        } else if (path.matches("/api/v1/borrows/[^/]+/handle-issue") && "POST".equalsIgnoreCase(request.getMethod())) {
            if (!tryConsume(shippingIssueBuckets, ip, SHIPPING_ISSUE_CAPACITY)) {
                sendRateLimitResponse(response, ip, path);
                return;
            }
        } else if ("/api/v1/borrows/delivery-issues".equals(path)) {
            if (!tryConsume(shippingListBuckets, ip, SHIPPING_LIST_CAPACITY)) {
                sendRateLimitResponse(response, ip, path);
                return;
            }
        }

        chain.doFilter(request, response);
    }

    private boolean tryConsume(Map<String, Bucket> buckets, String ip, int capacity) {
        Bucket bucket = buckets.computeIfAbsent(ip, k -> buildBucket(capacity));
        return bucket.tryConsume(1);
    }

    private static Bucket buildBucket(int capacity) {
        Bandwidth limit = Bandwidth.classic(capacity,
                Refill.intervally(capacity, WINDOW));
        return Bucket.builder().addLimit(limit).build();
    }

    private static String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static void sendRateLimitResponse(HttpServletResponse response,
                                               String ip,
                                               String path) throws IOException {
        log.warn("Rate limit exceeded: ip={}, path={}", ip, path);
        response.setStatus(429);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write("""
                {
                  "status": 429,
                  "code": "AUTH_TOO_MANY_ATTEMPTS",
                  "message": "Đã vượt quá số lần thử. Vui lòng thử lại sau 1 phút"
                }""");
    }
}
