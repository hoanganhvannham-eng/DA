package com.library.fine.presentation.dto.response;

import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
public class FineLevelListResponse {

    private final List<FineLevelResponse> fineLevels;
}
