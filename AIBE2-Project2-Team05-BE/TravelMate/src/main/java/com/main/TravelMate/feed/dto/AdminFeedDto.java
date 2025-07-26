package com.main.TravelMate.feed.dto;

import com.main.TravelMate.feed.entity.TravelFeed;
import lombok.Getter;

@Getter
public class AdminFeedDto {

    private Long id;
    private String imageUrl;
    private String caption;
    private String createdBy;
    private String status; // ✅ 피드 상태 추가 (ACTIVE, DEACTIVE)
    private Long travelPlanId; // ✅ 여행 계획 ID 추가 (모달용)

    public AdminFeedDto(TravelFeed feed) {
        this.id = feed.getId();
        this.imageUrl = feed.getImageUrl();
        this.caption = feed.getCaption();
        this.createdBy = feed.getUser().getNickname(); // 작성자 닉네임
        this.status = feed.getStatus(); // ✅ 피드 상태 설정
        this.travelPlanId = feed.getTravelPlan() != null ? feed.getTravelPlan().getId() : null; // ✅ 여행 계획 ID 추가
    }
}
