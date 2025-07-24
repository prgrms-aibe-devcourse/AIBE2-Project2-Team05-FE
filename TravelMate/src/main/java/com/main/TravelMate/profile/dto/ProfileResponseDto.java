package com.main.TravelMate.profile.dto;


import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Getter
public class ProfileResponseDto {
    private String nickname;
    private String bio;
    private String profileImage;
    private int age;
    private String gender;
    private int followerCount;
    private int followingCount;
    private List<TravelFeedResponseDto> feeds;
}