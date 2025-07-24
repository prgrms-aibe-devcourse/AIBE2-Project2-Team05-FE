package com.main.TravelMate.travelplan.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.util.List;
import java.util.Map;

/**
 * 여행 계획 저장 요청 DTO
 * 프론트엔드에서 전송하는 여행 계획 데이터
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanRequest {
    
    private String planId; // 프론트엔드 고유 ID
    private String userId; // 작성자 ID
    private String title; // 여행 제목
    private String destination; // 목적지
    private String startDate; // 시작 날짜
    private String endDate; // 종료 날짜
    private String period; // 기간
    private String budget; // 예산
    private String people; // 인원수
    private List<String> styles; // 여행 스타일
    private List<String> styleLabels; // 여행 스타일 라벨
    
    // 매칭 정보
    private MatchingInfo matchingInfo;
    
    // 작성자 정보
    private AuthorInfo author;
    
    // 일정 정보
    private Map<String, List<ScheduleItem>> schedules;
    
    // AI 생성 정보
    private List<String> aiHashtags;
    private List<RecommendedPlace> nearbyRecommendations;
    
    private String imageUrl; // 대표 이미지
    
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