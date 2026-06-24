package com.library.bookreturn.domain.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target(ElementType.TYPE)
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ReturnMethodValidator.class)
public @interface ReturnMethodConstraint {
    String message() default "Địa chỉ nhận sách là bắt buộc khi trả qua shipping";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
