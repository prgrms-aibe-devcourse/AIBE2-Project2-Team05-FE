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
    private Long id; // 사용자 ID 추가
    private String nickname;
    private String email; // 이메일 추가 (프론트엔드에서 사용자 구분용)
    private String bio;
    private String profileImage;
    private int age;
    private String gender;
    private int followerCount;
    private int followingCount;
    private int postsCount; // 게시물 수 추가
    private int createdTripsCount; // 생성한 여행 수 추가
    private int joinedTripsCount; // 참여한 여행 수 추가
    private List<TravelFeedResponseDto> feeds;
}