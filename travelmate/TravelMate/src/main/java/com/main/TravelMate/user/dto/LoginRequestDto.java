package com.main.TravelMate.user.dto;


import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginRequestDto {

    @NotBlank
    private String email;
    @NotBlank
    private String password;
}
