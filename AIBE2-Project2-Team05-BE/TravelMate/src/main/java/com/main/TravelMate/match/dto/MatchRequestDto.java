package com.main.TravelMate.match.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchRequestDto {
    private Long id;
    private Long requesterId;
    private Long receiverId;
    private Long travelPlanId;
    private String message;
    private String status;
    private String createdAt;
    
    // UserSummaryDto 필드들 추가
    private UserSummaryDto requester;
    private UserSummaryDto receiver;
    
    // TravelPlan 관련 필드 추가
    private String travelPlanTitle;
    private String destination;
    
    // 응답 관련 필드 추가
    private String respondedAt;
    
    // 기존 필드와의 호환성을 위한 별칭
    public Long getPlanId() {
        return travelPlanId;
    }
}
