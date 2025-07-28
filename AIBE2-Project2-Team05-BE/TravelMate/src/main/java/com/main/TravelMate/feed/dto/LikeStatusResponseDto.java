package com.main.TravelMate.feed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LikeStatusResponseDto {
    private boolean success;
    private boolean liked;
    private long likeCount;

    // 성공 응답 생성을 위한 정적 메서드
    public static LikeStatusResponseDto success(boolean liked, long likeCount) {
        return LikeStatusResponseDto.builder()
                .success(true)
                .liked(liked)
                .likeCount(likeCount)
                .build();
    }

    // 에러 응답 생성을 위한 정적 메서드
    public static LikeStatusResponseDto error() {
        return LikeStatusResponseDto.builder()
                .success(false)
                .liked(false)
                .likeCount(0)
                .build();
    }
} 