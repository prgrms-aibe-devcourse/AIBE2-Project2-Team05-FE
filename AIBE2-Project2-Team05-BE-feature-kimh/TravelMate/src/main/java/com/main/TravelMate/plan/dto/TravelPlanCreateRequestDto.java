package com.main.TravelMate.plan.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class TravelPlanCreateRequestDto {
    private String title;
    private String location;
    private LocalDate startDate;
    private LocalDate endDate;
    private String description;
    private String interests;
    private int numberOfPeople;
    private long budget;
    private String preferredGender;
    private String preferredAgeRange;
    private String preferredLanguage;
    private String matchingNote;
    private String accommodationInfo;
    private String transportationInfo;
    private String extraMemo;

    private List<TravelDayDto> days;
}
