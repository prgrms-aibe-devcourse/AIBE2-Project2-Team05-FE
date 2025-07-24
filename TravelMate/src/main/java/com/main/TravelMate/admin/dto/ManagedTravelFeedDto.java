package com.main.TravelMate.admin.dto;

import com.main.TravelMate.admin.entity.ManagedTravelFeed;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
public class ManagedTravelFeedDto {

    private Long id;
    private TravelFeedInfo travelFeed;
    private AdminInfo admin;
    private String status;
    private String reason;
    private LocalDateTime updatedAt;

    public ManagedTravelFeedDto(ManagedTravelFeed managedFeed) {
        this.id = managedFeed.getId();
        this.travelFeed = new TravelFeedInfo(managedFeed.getTravelFeed());
        this.admin = new AdminInfo(managedFeed.getAdmin());
        this.status = managedFeed.getStatus();
        this.reason = managedFeed.getReason();
        this.updatedAt = managedFeed.getUpdatedAt();
    }

    @Getter
    public static class TravelFeedInfo {
        private Long id;
        private String imageUrl;
        private String caption;
        private UserInfo user;

        public TravelFeedInfo(com.main.TravelMate.feed.entity.TravelFeed travelFeed) {
            this.id = travelFeed.getId();
            this.imageUrl = travelFeed.getImageUrl();
            this.caption = travelFeed.getCaption();
            this.user = new UserInfo(travelFeed.getUser());
        }
    }

    @Getter
    public static class UserInfo {
        private String nickname;

        public UserInfo(com.main.TravelMate.user.entity.User user) {
            this.nickname = user.getNickname();
        }
    }

    @Getter
    public static class AdminInfo {
        private Long id;
        private String email;
        private String name;

        public AdminInfo(com.main.TravelMate.admin.entity.Admin admin) {
            this.id = admin.getId();
            this.email = admin.getEmail();
            this.name = admin.getName();
        }
    }
} 