package com.main.TravelMate.admin.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class AdminSignupRequest {

    private String email;
    private String password;
    private String name;
}
