package com.main.TravelMate.feed.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class FeedResponseDto {
    private Long id;
    private String email;
    private String imageUrl;
    private String caption;
    private LocalDateTime createdAt;
}