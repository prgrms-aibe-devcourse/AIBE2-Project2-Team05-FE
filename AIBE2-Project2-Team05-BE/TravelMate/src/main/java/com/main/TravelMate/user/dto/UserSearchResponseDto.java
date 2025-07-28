package com.main.TravelMate.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 사용자 검색 결과를 위한 DTO
 * 채팅에서 사용자를 검색할 때 필요한 최소한의 정보만 포함
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSearchResponseDto {
    
    private Long id;           // 사용자 고유 ID
    private String nickname;   // 사용자 닉네임 (검색 대상)
    private String email;      // 사용자 이메일 (선택적으로 보여줄 수 있음)
    private String profileImage; // 프로필 이미지 URL (있으면 표시)
    
    /**
     * User 엔티티로부터 UserSearchResponseDto를 생성하는 정적 팩토리 메서드
     * @param user User 엔티티
     * @return UserSearchResponseDto 객체
     */
    public static UserSearchResponseDto fromUser(com.main.TravelMate.user.entity.User user) {
        return UserSearchResponseDto.builder()
                .id(user.getId())
                .nickname(user.getNickname())
                .email(user.getEmail())
                .profileImage(user.getProfile() != null ? user.getProfile().getProfileImage() : null)
                .build();
    }
} 