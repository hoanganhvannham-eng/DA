package com.library.shipping.presentation.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class HandleIssueRequest {

    @NotBlank(message = "Vui lòng chọn hành động xử lý")
    private String action;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String notes;

    private UUID replacementBookId;
}
