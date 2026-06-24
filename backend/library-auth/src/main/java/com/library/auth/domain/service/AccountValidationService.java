package com.library.auth.domain.service;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserStatus;
import com.library.auth.domain.exception.account.AccountDisabledException;
import com.library.auth.domain.exception.account.AccountPendingException;
import org.springframework.stereotype.Component;

@Component
public class AccountValidationService {

    public void validateLoginable(User user) {
        if (user.getStatus() == UserStatus.PENDING) {
            throw new AccountPendingException();
        }
        if (user.getStatus() == UserStatus.DISABLED) {
            throw new AccountDisabledException();
        }
    }
}
