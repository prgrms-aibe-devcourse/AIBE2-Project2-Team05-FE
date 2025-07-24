package com.main.TravelMate.plan.dto;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlanResponseDto {
    private Long id;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String interests;
    private String title;
    private long budget;
    private String destination;
    private Integer numberOfPeople;
    private LocalDateTime createdAt;
}