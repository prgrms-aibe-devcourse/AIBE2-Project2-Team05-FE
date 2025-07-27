package com.main.TravelMate.feed.dto;

import com.main.TravelMate.feed.domain.TravelStatus;
import lombok.*;

/**
 * 여행 상태 변경 요청 DTO
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelStatusUpdateRequest {
    
    private TravelStatus travelStatus;
    private String note; // 변경 사유 (선택적)
} 