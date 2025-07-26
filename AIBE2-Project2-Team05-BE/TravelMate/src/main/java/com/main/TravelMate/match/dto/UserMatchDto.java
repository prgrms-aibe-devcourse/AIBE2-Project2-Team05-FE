package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.entity.TravelStyle;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;

/**
 * 매칭 검색 결과로 반환되는 사용자 정보 DTO
 * 호환성 점수와 함께 여행자 정보를 제공
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserMatchDto {
    
    /**
     * 사용자 ID
     */
    private Long userId;
    
    /**
     * 사용자 닉네임
     */
    private String nickname;
    
    /**
     * 여행 계획 ID
     */
    private Long travelPlanId;
    
    /**
     * 여행 목적지
     */
    private String destination;
    
    /**
     * 여행 시작일
     */
    private LocalDate startDate;
    
    /**
     * 여행 종료일
     */
    private LocalDate endDate;
    
    /**
     * 여행 스타일
     */
    private TravelStyle travelStyle;
    
    /**
     * 여행 설명/관심사
     */
    private String description;
    
    /**
     * 예산
     */
    private Integer budget;
    
    /**
     * 희망 인원 수
     */
    private Integer numberOfPeople;
    
    /**
     * 호환성 점수 (0-100)
     * 목적지, 날짜, 여행 스타일 등을 종합한 매칭 점수
     */
    private Integer compatibilityScore;
    
    /**
     * 날짜 겹침 일수
     */
    private Integer overlappingDays;
}