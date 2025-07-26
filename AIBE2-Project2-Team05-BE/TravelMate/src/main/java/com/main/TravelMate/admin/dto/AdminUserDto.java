package com.main.TravelMate.admin.dto;

import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.domain.UserStatus;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AdminUserDto {

    private Long id;
    private String email;
    private String nickname;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;
    private String profileImage; // Profile 정보에서 이미지만 가져오기

    public AdminUserDto(User user) {
        this.id = user.getId();
        this.email = user.getEmail();
        this.nickname = user.getNickname();
        this.role = user.getRole();
        this.status = user.getStatus();
        this.createdAt = user.getCreatedAt();
        
        // Profile이 있으면 이미지 URL 가져오기, 없으면 null
        this.profileImage = (user.getProfile() != null) ? user.getProfile().getProfileImage() : null;
    }
} 