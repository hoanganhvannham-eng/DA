package com.library.common.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * Web MVC configuration — registers the request logging interceptor
 * and static resource handler for uploaded files.
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    private final RequestLoggingInterceptor requestLoggingInterceptor;
    private final Path storageBaseDir;

    public WebMvcConfig(
            RequestLoggingInterceptor requestLoggingInterceptor,
            @Value("${app.storage.base-dir}") String storageBaseDir
    ) {
        this.requestLoggingInterceptor = requestLoggingInterceptor;
        this.storageBaseDir = Paths.get(storageBaseDir).toAbsolutePath().normalize();
    }

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(requestLoggingInterceptor)
                .addPathPatterns("/api/**")
                .excludePathPatterns(
                        "/actuator/**",
                        "/favicon.ico"
                );
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(this.storageBaseDir.toUri().toString())
                .setCachePeriod(3600);
    }
}
