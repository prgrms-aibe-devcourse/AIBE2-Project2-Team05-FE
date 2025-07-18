package com.main.TravelMate.user.dto;


import com.main.TravelMate.user.domain.Role;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SignupRequest {
    @NotBlank
    private String email;
    @NotBlank
    private String password;
    @NotBlank
    private String nickname;
    private Role role = Role.USER;
}
