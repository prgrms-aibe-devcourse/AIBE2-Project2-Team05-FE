package com.main.TravelMate.match.dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * 매칭 요청 응답을 위한 DTO
 * 매칭 요청을 수락하거나 거절할 때 사용
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MatchResponseRequestDto {
    
    /**
     * 매칭 요청 ID
     */
    @NotNull(message = "매칭 요청 ID는 필수입니다")
    private Long matchId;
    
    /**
     * 응답하는 사용자 ID
     */
    @NotNull(message = "사용자 ID는 필수입니다")
    private Long userId;
    
    /**
     * 수락 여부 (true: 수락, false: 거절)
     */
    @NotNull(message = "수락 여부는 필수입니다")
    private boolean accept;
}