package com.main.TravelMate.feed.dto;

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

    private Long travelPlanId; // ✅ 이거 추가

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

    private String createdBy;         // ✅ 이거 추가
    private String profileImage;      // ✅ 프로필용 이미지
}