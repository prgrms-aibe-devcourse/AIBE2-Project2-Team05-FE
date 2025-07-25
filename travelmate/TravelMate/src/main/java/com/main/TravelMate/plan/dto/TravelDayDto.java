package com.main.TravelMate.plan.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelDayDto {
    private int dayNumber;
    private LocalDate date;
    private List<TravelScheduleDto> schedules;
}
