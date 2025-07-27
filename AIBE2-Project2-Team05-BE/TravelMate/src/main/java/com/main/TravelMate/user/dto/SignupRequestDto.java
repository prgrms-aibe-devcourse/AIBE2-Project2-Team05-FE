package com.main.TravelMate.user.dto;


import com.main.TravelMate.user.domain.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequestDto {
    // User 정보
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String nickname;
    private Role role = Role.USER;
    
    // Profile 정보
    private String realName; // 실명
    private Integer age; // 나이
    private String gender; // 성별
    private String bio; // 자기소개
    private String preferredDestinations; // 선호 여행지
    private String travelStyle; // 여행 스타일
    private String profileImage; // 프로필 이미지 URL
}
