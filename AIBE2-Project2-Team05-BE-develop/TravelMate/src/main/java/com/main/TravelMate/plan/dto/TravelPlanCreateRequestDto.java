package com.main.TravelMate.plan.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TravelPlanCreateRequestDto {
    private String title;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String interests;
    private int numberOfPeople;
    private long budget;
    private String preferredGender;
    private String preferredAgeRange;
    private String preferredLanguage;
    private String matchingNote;
    private String accommodationInfo;
    private String transportationInfo;
    private String extraMemo;

    private List<TravelDayDto> days;
    
    // Legacy 호환 필드
    private Boolean matchingEnabled;  // 매칭 활성화 여부
    
    // Google Places & OpenAI API 결과 저장 필드
    private String styles;                    // 여행 스타일 (JSON 문자열)
    private String styleLabels;               // 여행 스타일 라벨 (JSON 문자열) 
    private String schedules;                 // 일정 정보 (JSON 문자열)
    private String aiHashtags;                // AI 생성 해시태그 (JSON 문자열)
    private String nearbyRecommendations;     // AI 추천 장소 (JSON 문자열)
    private String imageUrl;                  // 구글 플레이스 대표 이미지 URL
}
