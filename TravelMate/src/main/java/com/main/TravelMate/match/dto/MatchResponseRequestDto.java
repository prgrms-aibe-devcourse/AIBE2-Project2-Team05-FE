package com.main.TravelMate.match.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 매칭 요청 응답을 위한 DTO
 * 매칭 요청을 수락하거나 거절할 때 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseRequestDto {
    
    /**
     * 수락 여부 (true: 수락, false: 거절)
     */
    @NotNull(message = "수락 여부는 필수입니다")
    private boolean accept;
}