package com.main.TravelMate.plan.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class TravelSchedule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private TravelDay travelDay;

    private String time;
    private String place;
    private String activity;
    private String memo;
    private int cost;
    
    // 장소 카테고리 정보 추가
    @Column(length = 50)
    private String category;        // 카테고리명 (예: "수족관", "테마파크", "맛집" 등)
    
    @Column(length = 10)
    private String categoryIcon;    // 카테고리 아이콘 (예: "🐠", "🎢", "🍽️" 등)
    
    @Column(columnDefinition = "TEXT")
    private String categoryBackground;  // 카테고리 배경색 (그라데이션)
    
    @Column(length = 20)
    private String categoryTextColor;   // 카테고리 텍스트 색상
    
    @Column(length = 20)
    private String categoryBorderColor; // 카테고리 테두리 색상
}
