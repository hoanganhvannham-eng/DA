package com.library.user.application.service;

import com.library.auth.domain.entity.User;
import com.library.auth.domain.enums.UserRole;
import com.library.auth.domain.enums.UserStatus;
import com.library.user.domain.exception.InvalidStatusException;
import com.library.user.domain.exception.LastAdminException;
import com.library.user.domain.exception.SelfDeactivateException;
import com.library.user.domain.exception.SelfRoleChangeException;
import com.library.user.domain.exception.UserNotFoundException;
import com.library.user.infrastructure.persistence.UserQueryRepository;
import com.library.user.presentation.dto.response.AssignRoleResponse;
import com.library.user.presentation.dto.response.StatusUpdateResponse;
import com.library.user.presentation.dto.response.UserListItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.UUID;

@Slf4j
@Service
@Transactional
public class UserCommandService {

    private final UserQueryRepository userQueryRepository;

    public UserCommandService(UserQueryRepository userQueryRepository) {
        this.userQueryRepository = userQueryRepository;
    }

    public StatusUpdateResponse updateUserStatus(UUID targetUserId, UserStatus newStatus, UUID adminId) {
        validateStatusTransition(newStatus);

        User user = userQueryRepository.findById(targetUserId)
                .orElseThrow(UserNotFoundException::new);

        if (newStatus == UserStatus.DISABLED && targetUserId.equals(adminId)) {
            throw new SelfDeactivateException();
        }

        int updatedRows;
        String message;
        UserStatus expectedCurrent;

        if (newStatus == UserStatus.DISABLED) {
            expectedCurrent = UserStatus.ACTIVE;
            updatedRows = userQueryRepository.deactivateUser(targetUserId, adminId, UserStatus.DISABLED, expectedCurrent);
            message = "Vô hiệu hóa tài khoản thành công";
        } else {
            expectedCurrent = UserStatus.DISABLED;
            updatedRows = userQueryRepository.activateUser(targetUserId, adminId, UserStatus.ACTIVE, expectedCurrent);
            message = "Kích hoạt tài khoản thành công";
        }

        log.info("Admin {} changed user {} status from {} to {} (rows={})",
                adminId, targetUserId, expectedCurrent, newStatus, updatedRows);

        UserListItem updatedUser = toUserListItem(user);
        updatedUser.setStatus(newStatus);

        return new StatusUpdateResponse(message, updatedUser);
    }

    public AssignRoleResponse assignRole(UUID targetUserId, UserRole newRole, UUID adminId) {
        User user = userQueryRepository.findByIdWithLock(targetUserId)
                .orElseThrow(UserNotFoundException::new);

        if (targetUserId.equals(adminId)) {
            throw new SelfRoleChangeException();
        }

        if (user.getRole() == UserRole.ADMIN && newRole != UserRole.ADMIN) {
            long otherActiveAdmins = userQueryRepository.countOtherActiveAdmins(targetUserId, UserStatus.ACTIVE);
            if (otherActiveAdmins == 0) {
                throw new LastAdminException();
            }
        }

        UserRole oldRole = user.getRole();
        userQueryRepository.updateRole(targetUserId, adminId, newRole);

        log.info("Admin {} changed user {} role from {} to {}", adminId, targetUserId, oldRole, newRole);

        return new AssignRoleResponse(
                "Gán vai trò thành công",
                user,
                newRole,
                Instant.now()
        );
    }

    private void validateStatusTransition(UserStatus status) {
        if (status != UserStatus.ACTIVE && status != UserStatus.DISABLED) {
            throw new InvalidStatusException();
        }
    }

    private UserListItem toUserListItem(User user) {
        return new UserListItem(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getJoinedDate(),
                user.getStatus()
        );
    }
}
