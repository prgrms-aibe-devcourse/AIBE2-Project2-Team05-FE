package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.entity.MatchStatus;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class MatchResponseDto {
    private Long matchId;
    private Long travelPlanId;
    private String travelPlanLocation;
    private String requesterNickname;
    private String receiverNickname;
    private MatchStatus status;
}