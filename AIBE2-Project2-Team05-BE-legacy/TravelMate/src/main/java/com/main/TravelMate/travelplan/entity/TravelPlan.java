package com.main.TravelMate.travelplan.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

/**
 * 여행 계획 엔티티
 * 사용자가 작성한 여행 계획 정보를 저장
 */
@Entity
@Table(name = "travel_plan")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlan {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String planId; // 프론트엔드에서 사용하는 고유 ID
    
    @Column(nullable = false)
    private String userId; // 작성자 ID
    
    @Column(nullable = false, length = 200)
    private String title; // 여행 제목
    
    @Column(nullable = false, length = 100)
    private String destination; // 목적지
    
    @Column(nullable = false)
    private String startDate; // 시작 날짜
    
    @Column(nullable = false)
    private String endDate; // 종료 날짜
    
    @Column(length = 50)
    private String period; // 기간 (예: "2박 3일")
    
    @Column(length = 50)
    private String budget; // 예산
    
    @Column(length = 50)
    private String people; // 인원수
    
    @Column(columnDefinition = "TEXT")
    private String styles; // 여행 스타일 (JSON 배열 문자열)
    
    @Column(columnDefinition = "TEXT")
    private String styleLabels; // 여행 스타일 라벨 (JSON 배열 문자열)
    
    // 매칭 정보
    @Column(length = 20)
    private String preferredGender; // 선호 성별
    
    @Column(length = 50)
    private String preferredAge; // 선호 연령대
    
    @Column(length = 50)
    private String preferredLanguage; // 선호 언어
    
    @Column(columnDefinition = "TEXT")
    private String matchingMemo; // 매칭 메모
    
    @Column(nullable = false)
    private Boolean matchingEnabled = false; // 매칭 활성화 여부
    
    // 작성자 정보
    @Column(nullable = false, length = 100)
    private String authorName; // 작성자 이름
    
    @Column(length = 500)
    private String authorProfileImage; // 작성자 프로필 이미지
    
    // 일정 및 추가 정보
    @Column(columnDefinition = "LONGTEXT")
    private String schedules; // 일정 정보 (JSON 형태)
    
    @Column(columnDefinition = "TEXT")
    private String aiHashtags; // AI 생성 해시태그 (JSON 배열)
    
    @Column(columnDefinition = "LONGTEXT")
    private String nearbyRecommendations; // AI 추천 장소 (JSON 형태)
    
    @Column(columnDefinition = "TEXT")
    private String imageUrl; // 대표 이미지 URL
    
    // 메타 정보
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(nullable = false)
    private LocalDateTime updatedAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
} 