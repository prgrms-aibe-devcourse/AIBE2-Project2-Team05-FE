package com.main.TravelMate.feed.dto;

import com.main.TravelMate.feed.entity.TravelFeed;
import lombok.Getter;

@Getter
public class AdminFeedDto {

    private Long id;
    private String imageUrl;
    private String caption;
    private String createdBy;

    public AdminFeedDto(TravelFeed feed) {
        this.id = feed.getId();
        this.imageUrl = feed.getImageUrl();
        this.caption = feed.getCaption();
        this.createdBy = feed.getUser().getNickname(); // 작성자 닉네임
    }
}
