package com.main.TravelMate.feed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeResponseDto {
    private boolean success;
    private boolean liked;
    private long likeCount;
    private String message;

    // 성공 응답 생성을 위한 정적 메서드
    public static LikeResponseDto success(boolean liked, long likeCount, String message) {
        return LikeResponseDto.builder()
                .success(true)
                .liked(liked)
                .likeCount(likeCount)
                .message(message)
                .build();
    }

    // 에러 응답 생성을 위한 정적 메서드
    public static LikeResponseDto error(String message) {
        return LikeResponseDto.builder()
                .success(false)
                .liked(false)
                .likeCount(0)
                .message(message)
                .build();
    }
} 