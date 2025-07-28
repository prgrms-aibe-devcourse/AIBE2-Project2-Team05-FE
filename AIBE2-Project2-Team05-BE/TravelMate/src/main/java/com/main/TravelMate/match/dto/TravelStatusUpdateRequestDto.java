package com.main.TravelMate.match.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TravelStatusUpdateRequestDto {
    private Long travelPlanId;
    private String status;
}
