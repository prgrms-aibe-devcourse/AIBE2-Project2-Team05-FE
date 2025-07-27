package com.main.TravelMate.plan.entity;

import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.match.entity.TravelStyle;
import jakarta.persistence.*;
import lombok.*;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelPlan {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User user;

    @Column(nullable = false)
    private String title;

    private String location;

    private LocalDate startDate;
    private LocalDate endDate;

    @Lob
    private String description;

    private String interests;


    private long budget;

    private String destination;

    private Integer numberOfPeople;

    @OneToMany(mappedBy = "travelPlan", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TravelDay> days;


    @Column(length = 50)
    private String preferredGender;

    @Column(length = 50)
    private String preferredAgeRange;

    @Column(length = 50)
    private String preferredLanguage;

    @Column(columnDefinition = "TEXT")
    private String matchingNote;

    @Column(columnDefinition = "TEXT")
    private String accommodationInfo;

    @Column(columnDefinition = "TEXT")
    private String transportationInfo;

    @Column(columnDefinition = "TEXT")
    private String extraMemo;

    // 매칭 모집 상태 필드 추가
    @Column(nullable = false)
    private Boolean recruiting = true; // 기본값 true로 설정

    // Legacy에서 가져온 추가 필드들
    @Column(unique = true)
    private String planId; // 프론트엔드에서 사용하는 고유 ID
    
    @Column(columnDefinition = "TEXT")
    private String styles; // 여행 스타일 (JSON 배열 문자열)
    
    @Column(columnDefinition = "TEXT")
    private String styleLabels; // 여행 스타일 라벨 (JSON 배열 문자열)
    
    @Column(nullable = false)
    private Boolean matchingEnabled = false; // 매칭 활성화 여부
    
    @Column(columnDefinition = "LONGTEXT")
    private String schedules; // 일정 정보 (JSON 형태) - legacy 호환용
    
    @Column(columnDefinition = "TEXT")
    private String aiHashtags; // AI 생성 해시태그 (JSON 배열)
    
    @Column(columnDefinition = "LONGTEXT")
    private String nearbyRecommendations; // AI 추천 장소 (JSON 형태)
    
    @Column(columnDefinition = "TEXT")
        private String imageUrl; // 대표 이미지 URL
    
    @Column(nullable = true)
    private String authorName; // 작성자 이름 (DB 호환용)
    
    @Enumerated(EnumType.STRING)
    private TravelStyle travelStyle; // 여행 스타일 (매칭용)
    
    private LocalDateTime createdAt = LocalDateTime.now();
}