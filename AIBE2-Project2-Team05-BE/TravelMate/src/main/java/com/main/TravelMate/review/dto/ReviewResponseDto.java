package com.main.TravelMate.review.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * 후기 응답 DTO
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReviewResponseDto {

    private Long id;
    private Long travelFeedId;
    private String title;
    private String content;
    private Integer rating;
    private List<String> tags;
    private List<String> imageUrls;
    private LocalDateTime createdAt;
    
    // 작성자 정보
    private AuthorInfo author;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AuthorInfo {
        private Long id;
        private String email;
        private String nickname;
        private String profileImageUrl;
    }
} 