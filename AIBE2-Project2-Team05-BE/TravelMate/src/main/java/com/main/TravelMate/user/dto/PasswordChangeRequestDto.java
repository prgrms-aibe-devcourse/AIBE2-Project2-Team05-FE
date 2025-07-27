package com.main.TravelMate.user.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * 비밀번호 변경 요청 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PasswordChangeRequestDto {
    
    @NotBlank(message = "현재 비밀번호는 필수입니다")
    private String currentPassword;
    
    @NotBlank(message = "새 비밀번호는 필수입니다")
    @Size(min = 6, max = 20, message = "새 비밀번호는 6-20자 사이여야 합니다")
    private String newPassword;
    
    @NotBlank(message = "새 비밀번호 확인은 필수입니다")
    private String newPasswordConfirm;
} 