package com.library.user.application.service;

import com.library.auth.domain.enums.UserRole;
import com.library.user.domain.exception.InvalidRoleFilterException;
import com.library.user.infrastructure.persistence.UserQueryRepository;
import com.library.user.presentation.dto.response.PaginatedResult;
import com.library.user.presentation.dto.response.UserListItem;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class UserQueryService {

    private final UserQueryRepository userQueryRepository;

    public UserQueryService(UserQueryRepository userQueryRepository) {
        this.userQueryRepository = userQueryRepository;
    }

    public PaginatedResult<UserListItem> getFilteredUsers(String keyword, String role, int page, int size) {
        Pageable pageable = PageRequest.of(page - 1, size);
        Page<com.library.auth.domain.entity.User> userPage;

        if (keyword != null && !keyword.isBlank()) {
            userPage = userQueryRepository.searchByKeyword(keyword.trim(), pageable);
        } else if (role != null && !role.isBlank()) {
            UserRole userRole = parseRole(role.trim());
            userPage = userQueryRepository.findByRole(userRole, pageable);
        } else {
            userPage = userQueryRepository.findAllByOrderByJoinedDateDesc(pageable);
        }

        List<UserListItem> items = userPage.getContent().stream()
                .map(this::toUserListItem)
                .toList();

        return new PaginatedResult<>(items, userPage.getTotalElements(), page, size);
    }

    private UserRole parseRole(String role) {
        try {
            return UserRole.valueOf(role.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new InvalidRoleFilterException();
        }
    }

    private UserListItem toUserListItem(com.library.auth.domain.entity.User user) {
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
