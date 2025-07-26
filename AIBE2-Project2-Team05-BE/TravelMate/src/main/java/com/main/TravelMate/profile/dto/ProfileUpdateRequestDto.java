package com.main.TravelMate.profile.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ProfileUpdateRequestDto {
    private String nickname;        // 닉네임 추가
    private String realName;
    private int age;
    private String gender;
    private String preferredDestinations;
    private String travelStyle;
    private String bio;
    private String profileImage;
}