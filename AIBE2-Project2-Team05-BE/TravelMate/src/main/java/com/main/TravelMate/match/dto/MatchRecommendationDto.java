package com.main.TravelMate.match.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class MatchRecommendationDto {
    private Long userId;
    private String nickname;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private Long travelPlanId;
    private int compatibilityScore;
}
