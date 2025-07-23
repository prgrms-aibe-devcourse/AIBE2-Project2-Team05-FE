package com.main.TravelMate.user.dto;


import com.main.TravelMate.user.domain.Role;
import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String email;
    private Role role;
}