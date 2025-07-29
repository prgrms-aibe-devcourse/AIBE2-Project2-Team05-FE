package com.main.TravelMate.feed.dto;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LikeToggleRequestDto {
    private Long travelFeedId;
} 