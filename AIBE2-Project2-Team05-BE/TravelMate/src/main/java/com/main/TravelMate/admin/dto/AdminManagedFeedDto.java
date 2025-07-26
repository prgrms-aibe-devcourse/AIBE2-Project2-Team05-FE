package com.main.TravelMate.admin.dto;

import com.main.TravelMate.admin.entity.ManagedTravelFeed;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class AdminManagedFeedDto {

    private Long id;
    private Long feedId;
    private String feedCaption;
    private String feedImageUrl;
    private String feedCreatedBy;
    private String status;
    private String reason;
    private String managedByAdmin;
    private LocalDateTime updatedAt;

    public AdminManagedFeedDto(ManagedTravelFeed managedFeed) {
        this.id = managedFeed.getId();
        this.feedId = managedFeed.getTravelFeed().getId();
        this.feedCaption = managedFeed.getTravelFeed().getCaption();
        this.feedImageUrl = managedFeed.getTravelFeed().getImageUrl();
        this.feedCreatedBy = managedFeed.getTravelFeed().getUser().getNickname();
        this.status = managedFeed.getStatus();
        this.reason = managedFeed.getReason();
        this.managedByAdmin = managedFeed.getAdmin().getEmail();
        this.updatedAt = managedFeed.getUpdatedAt();
    }
} 