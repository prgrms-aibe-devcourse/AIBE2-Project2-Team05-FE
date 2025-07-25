package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.entity.MatchStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * 매칭 요청 정보를 담는 DTO
 * 매칭 요청 전송, 응답, 조회 시 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRequestDto {
    
    /**
     * 매칭 요청 ID
     */
    private Long id;
    
    /**
     * 요청자 정보
     */
    private UserSummaryDto requester;
    
    /**
     * 수신자 정보
     */
    private UserSummaryDto receiver;
    
    /**
     * 관련 여행 계획 ID
     */
    private Long travelPlanId;
    
    /**
     * 여행 계획 제목
     */
    private String travelPlanTitle;
    
    /**
     * 여행 목적지
     */
    private String destination;
    
    /**
     * 매칭 상태 (PENDING, ACCEPTED, REJECTED)
     */
    private MatchStatus status;
    
    /**
     * 매칭 요청 메시지
     */
    private String message;
    
    /**
     * 요청 생성 시간
     */
    private LocalDateTime createdAt;
    
    /**
     * 응답 시간
     */
    private LocalDateTime respondedAt;
}