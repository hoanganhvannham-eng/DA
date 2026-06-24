package com.library.book.common.config;

import com.library.book.domain.enums.BookSortOption;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.format.FormatterRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class BookWebConfig implements WebMvcConfigurer {

    @Override
    public void addFormatters(FormatterRegistry registry) {
        registry.addConverter(new Converter<String, BookSortOption>() {
            @Override
            public BookSortOption convert(String source) {
                try {
                    return BookSortOption.valueOf(source.toUpperCase());
                } catch (IllegalArgumentException e) {
                    return BookSortOption.NAME_ASC; // Fallback or could throw exception
                }
            }
        });
    }
}
