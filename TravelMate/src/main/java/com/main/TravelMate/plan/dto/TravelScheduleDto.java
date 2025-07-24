package com.main.TravelMate.plan.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelScheduleDto {
    private String time;
    private String place;
    private String activity;
    private String memo;
    private int cost;
}
