package com.library.bookreturn.domain.validation;

import com.library.bookreturn.domain.enums.ReturnMethod;
import com.library.bookreturn.presentation.dto.request.CreateReturnRequest;
import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

public class ReturnMethodValidator implements ConstraintValidator<ReturnMethodConstraint, CreateReturnRequest> {

    @Override
    public boolean isValid(CreateReturnRequest request, ConstraintValidatorContext context) {
        if (request == null) return true;
        if (request.getReturnMethod() == ReturnMethod.SHIPPING) {
            return request.getPickupAddress() != null && !request.getPickupAddress().isBlank();
        }
        return true;
    }
}
