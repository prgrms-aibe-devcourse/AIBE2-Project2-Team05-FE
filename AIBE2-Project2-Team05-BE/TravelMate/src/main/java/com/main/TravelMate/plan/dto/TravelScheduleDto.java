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
    
    // 장소 카테고리 정보 추가
    private String category;            // 카테고리명 (예: "수족관", "테마파크", "맛집" 등)
    private String categoryIcon;        // 카테고리 아이콘 (예: "🐠", "🎢", "🍽️" 등)
    private String categoryBackground;  // 카테고리 배경색 (그라데이션)
    private String categoryTextColor;   // 카테고리 텍스트 색상
    private String categoryBorderColor; // 카테고리 테두리 색상
}
