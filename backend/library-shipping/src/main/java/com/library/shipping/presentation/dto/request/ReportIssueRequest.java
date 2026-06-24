package com.library.shipping.presentation.dto.request;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReportIssueRequest {

    @NotBlank(message = "Vui lòng chọn loại vấn đề")
    @Size(max = 50, message = "Loại vấn đề tối đa 50 ký tự")
    private String issueType;

    @NotBlank(message = "Vui lòng mô tả vấn đề")
    @Size(max = 500, message = "Mô tả tối đa 500 ký tự")
    private String issueDescription;
}
