package com.main.TravelMate.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AdminLoginResponse {

    private String accessToken;
    private String email;
    private String name;
    private String role;
    private Long id;
}