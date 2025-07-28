package com.main.TravelMate.match.dto;

import com.main.TravelMate.match.domain.MatchingStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class MatchResponseDto {
    private Long matchId;
    private MatchingStatus status;
}
