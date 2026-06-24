package com.library.book.presentation.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ISBNValidator implements ConstraintValidator<ValidISBN, String> {

    private static final String ISBN10_PATTERN = "^\\d{9}[\\dX]$";
    private static final String ISBN13_PATTERN = "^(978|979)\\d{10}$";

    @Override
    public boolean isValid(String value, ConstraintValidatorContext context) {
        if (value == null || value.isBlank()) {
            return true;
        }

        String normalized = value.replaceAll("[\\s-]", "").toUpperCase();

        return normalized.matches(ISBN10_PATTERN) || normalized.matches(ISBN13_PATTERN);
    }
}
