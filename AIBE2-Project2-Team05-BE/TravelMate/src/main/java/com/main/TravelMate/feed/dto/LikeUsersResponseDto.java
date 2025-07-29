package com.main.TravelMate.feed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeUsersResponseDto {
    private boolean success;
    private List<LikeUserDto> users;
    private long totalCount;
    private String message;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class LikeUserDto {
        private Long userId;
        private String nickname;
        private String profileImageUrl;
        private String likedAt;
    }

    // 성공 응답 생성을 위한 정적 메서드
    public static LikeUsersResponseDto success(List<LikeUserDto> users, long totalCount) {
        return LikeUsersResponseDto.builder()
                .success(true)
                .users(users)
                .totalCount(totalCount)
                .message("좋아요한 사용자 목록을 조회했습니다")
                .build();
    }

    // 에러 응답 생성을 위한 정적 메서드
    public static LikeUsersResponseDto error(String message) {
        return LikeUsersResponseDto.builder()
                .success(false)
                .users(List.of())
                .totalCount(0)
                .message(message)
                .build();
    }
} 