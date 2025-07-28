package com.main.TravelMate.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@AllArgsConstructor
public class AdminLoginResponse {

    private String accessToken;
    private String email;
    private String nickname;
    private String role;
    private Long userId;
}