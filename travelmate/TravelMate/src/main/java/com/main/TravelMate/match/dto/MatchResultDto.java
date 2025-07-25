package com.main.TravelMate.match.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.time.LocalDate;

// 매칭 상대를 찾기 위한 결과 DTO
@Data
@AllArgsConstructor
public class MatchResultDto {
    private Long userId;
    private String nickname;
    private Long travelPlanId;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String interests;
    private double matchRate; // 매칭률
}