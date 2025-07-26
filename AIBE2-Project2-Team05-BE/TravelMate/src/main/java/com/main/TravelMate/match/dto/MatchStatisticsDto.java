package com.main.TravelMate.match.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 매칭 시스템 통계 정보 DTO
 * 관리자가 매칭 시스템의 성과를 모니터링할 때 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchStatisticsDto {
    
    /**
     * 총 매칭 요청 수
     */
    private Long totalMatchRequests;
    
    /**
     * 수락된 매칭 요청 수
     */
    private Long acceptedMatchRequests;
    
    /**
     * 거절된 매칭 요청 수
     */
    private Long rejectedMatchRequests;
    
    /**
     * 대기 중인 매칭 요청 수
     */
    private Long pendingMatchRequests;
    
    /**
     * 현재 활성화된 매칭 수 (수락된 매칭)
     */
    private Long activeMatches;
    
    /**
     * 매칭 성공률 (%)
     * (수락된 요청 수 / 전체 요청 수) * 100
     */
    private Double successRate;
    
    /**
     * 평균 응답 시간 (시간 단위)
     */
    private Double averageResponseTimeHours;
    
    /**
     * 가장 인기 있는 목적지
     */
    private String mostPopularDestination;
    
    /**
     * 가장 인기 있는 여행 스타일
     */
    private String mostPopularTravelStyle;
    
    /**
     * 통계 생성 시간
     */
    private LocalDateTime generatedAt;
    
    /**
     * 통계 기간 시작일
     */
    private LocalDateTime periodStart;
    
    /**
     * 통계 기간 종료일
     */
    private LocalDateTime periodEnd;
}