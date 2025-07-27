package com.main.TravelMate.feed.dto;

import com.main.TravelMate.feed.domain.TravelStatus;
import com.main.TravelMate.plan.dto.TravelDayDto;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TravelFeedResponseDto {

    private Long id; // TravelFeed ID (TravelPlan ID와 동일)
    private Long travelPlanId; // ✅ 호환성을 위해 유지
    
    private String planId; // ✅ 실제 planId 추가

    private String title;
    private String location;
    private String description;
    private String interests;
    private int numberOfPeople;
    private long budget;
    private LocalDate startDate;
    private LocalDate endDate;

    private List<TravelDayDto> days;

    private String imageUrl;
    private String caption;
    private String status; // ✅ 피드 상태 추가
    private TravelStatus travelStatus; // ✅ 여행 진행 상태 추가

    private String createdBy;         // ✅ 이거 추가
    private String profileImage;      // ✅ 프로필용 이미지
    private String authorName;        // ✅ 여행 계획 작성자 이름 (여행리더 구분용)
}