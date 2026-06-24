package com.library.auth.presentation.dto.profile;

import com.library.auth.domain.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter @Builder @AllArgsConstructor
public class ProfileResponse {
    private String name;
    private String email;
    private String phone;
    private String address;
    private Instant joinedDate;
    private UserRole role;
    private Integer borrowCount;
    private BigDecimal totalFines;
}
