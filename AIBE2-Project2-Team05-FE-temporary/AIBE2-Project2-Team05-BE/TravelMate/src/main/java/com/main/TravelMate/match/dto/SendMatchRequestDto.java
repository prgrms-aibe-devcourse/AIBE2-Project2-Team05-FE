package com.main.TravelMate.match.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

/**
 * 매칭 요청 전송을 위한 DTO
 * 클라이언트에서 매칭 요청을 보낼 때 사용
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SendMatchRequestDto {
    
    /**
     * 매칭 요청을 받을 사용자 ID
     */
    @NotNull(message = "수신자 ID는 필수입니다")
    private Long receiverId;
    
    /**
     * 관련 여행 계획 ID
     */
    @NotNull(message = "여행 계획 ID는 필수입니다")
    private Long travelPlanId;
    
    /**
     * 매칭 요청 메시지
     */
    @Size(max = 500, message = "메시지는 500자 이하여야 합니다")
    private String message;
}