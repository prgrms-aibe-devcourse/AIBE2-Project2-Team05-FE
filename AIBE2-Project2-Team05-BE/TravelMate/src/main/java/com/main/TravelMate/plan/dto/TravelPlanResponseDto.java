package com.main.TravelMate.plan.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanResponseDto {
    private Long id;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String interests;
    private String title;
    private long budget;
    private String destination;
    private Integer numberOfPeople;
    private LocalDateTime createdAt;
    
    // Legacy 호환 필드
    private String planId;
    private Boolean matchingEnabled;
    private String imageUrl;
    private String aiHashtags;
    private String nearbyRecommendations;
    private String schedules; // 일정 정보 (JSON 형태)
    
    // 사용자 관련 필드 추가
    private String participants; // 참여자 ID 리스트 (JSON 배열)
    private String introduction; // 소개글
    
    // 작성자 정보
    private Long authorId; // 작성자 ID
    private String authorNickname; // 작성자 닉네임
    private String authorProfileImage; // 작성자 프로필 이미지
}