package com.library.auth.presentation.validation;

import com.library.auth.presentation.dto.auth.ResetPasswordRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ResetPasswordMatchesValidator
        implements ConstraintValidator<ResetPasswordMatches, ResetPasswordRequest> {

    @Override
    public boolean isValid(ResetPasswordRequest request, ConstraintValidatorContext context) {
        if (request == null) {
            return true;
        }
        String newPassword     = request.getNewPassword();
        String confirmPassword = request.getConfirmPassword();

        if (newPassword == null || confirmPassword == null) {
            return true;
        }

        if (newPassword.equals(confirmPassword)) {
            return true;
        }

        context.disableDefaultConstraintViolation();
        context.buildConstraintViolationWithTemplate(context.getDefaultConstraintMessageTemplate())
               .addPropertyNode("confirmPassword")
               .addConstraintViolation();
        return false;
    }
}
