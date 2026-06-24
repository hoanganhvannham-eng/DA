package com.library.auth.presentation.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequest(
        @NotBlank(message = "Email không được để trống")
        @Email(message = "Email không đúng định dạng")
        String email,
        @NotBlank(message = "Mật khẩu không được để trống")
        @Size(min = 8, max = 16, message = "Mật khẩu phải từ 8 đến 16 ký tự")
        String password
) {}
