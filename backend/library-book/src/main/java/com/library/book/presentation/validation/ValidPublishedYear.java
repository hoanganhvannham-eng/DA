package com.library.book.presentation.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = PublishedYearValidator.class)
@Target({ ElementType.FIELD, ElementType.PARAMETER })
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPublishedYear {
    String message() default "Năm xuất bản không hợp lệ (phải từ 1900 đến năm hiện tại)";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
