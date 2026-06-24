package com.library.borrow.presentation.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DepositPolicyResponse {

    private UUID id;
    private String code;
    private String name;
    private Integer depositRate;
    private String description;
}
