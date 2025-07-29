package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.domain.MatchingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MatchResponseDto {
    private Long matchId;
    private MatchingStatus status;
    
    // 🔧 요청을 보낸 사람 정보 (받은 요청에서 중요)
    private Long senderId;
    private String senderNickname;
    
    // 🔧 요청을 받은 사람 정보 (보낸 요청에서 중요)
    private Long receiverId;
    private String receiverNickname;
    
    // 🔧 여행 계획 정보
    private Long planId;
    private String planTitle;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer numberOfPeople;
    private Integer budget;
    
    // 🔧 기존 생성자 호환을 위한 추가 생성자
    public MatchResponseDto(Long matchId, MatchingStatus status) {
        this.matchId = matchId;
        this.status = status;
    }
}
