package com.main.TravelMate.admin.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminSignupRequest {

    private String email;
    private String password;
    private String name;
}
