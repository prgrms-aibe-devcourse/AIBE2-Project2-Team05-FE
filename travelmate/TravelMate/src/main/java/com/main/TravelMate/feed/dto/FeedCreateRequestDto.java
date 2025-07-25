package com.main.TravelMate.feed.dto;

import lombok.Data;

@Data
public class FeedCreateRequestDto {
    private Long travelPlanId;
    private String imageUrl;
    private String caption;
}
