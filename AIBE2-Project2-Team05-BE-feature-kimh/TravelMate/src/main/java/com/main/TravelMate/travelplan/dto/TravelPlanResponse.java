package com.main.TravelMate.travelplan.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * 여행 계획 응답 DTO
 * 클라이언트에게 전송하는 여행 계획 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanResponse {
    
    private String planId;
    private String userId;
    private String title;
    private String destination;
    private String startDate;
    private String endDate;
    private String period;
    private String budget;
    private String people;
    private List<String> styles;
    private List<String> styleLabels;
    
    // 매칭 정보
    private MatchingInfo matchingInfo;
    private Boolean matchingEnabled;
    
    // 작성자 정보
    private AuthorInfo author;
    
    // 일정 정보
    private Map<String, List<ScheduleItem>> schedules;
    
    // AI 생성 정보
    private List<String> aiHashtags;
    private List<RecommendedPlace> nearbyRecommendations;
    
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    /**
     * 매칭 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MatchingInfo {
        private String preferredGender;
        private String preferredAge;
        private String preferredLanguage;
        private String matchingMemo;
    }
    
    /**
     * 작성자 정보 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AuthorInfo {
        private String id;
        private String name;
        private String profileImage;
    }
    
    /**
     * 일정 아이템 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ScheduleItem {
        private String time;
        private String place;
        private String activity;
        private String memo;
    }
    
    /**
     * 추천 장소 내부 클래스
     */
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecommendedPlace {
        private String name;
        private String description;
        private String category;
        private String distance;
        private Boolean verified;
        private String source;
        private Double rating;
        private List<String> tags;
    }
} 