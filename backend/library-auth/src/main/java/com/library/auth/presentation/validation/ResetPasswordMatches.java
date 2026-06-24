package com.library.auth.presentation.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Documented
@Constraint(validatedBy = ResetPasswordMatchesValidator.class)
@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
public @interface ResetPasswordMatches {

    String message() default "Xác nhận mật khẩu mới không khớp";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}
