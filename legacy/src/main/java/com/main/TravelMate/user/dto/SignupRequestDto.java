package com.main.TravelMate.user.dto;

import com.main.TravelMate.user.domain.Gender;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.domain.TravelStyle;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.Set;

@Getter
@Setter
public class SignupRequestDto {

    // User-related fields
    @NotBlank(message = "이메일은 필수 입력 항목입니다.")
    @Email(message = "유효한 이메일 형식이 아닙니다.")
    private String email;

    @NotBlank(message = "비밀번호는 필수 입력 항목입니다.")
    @Size(min = 8, message = "비밀번호는 최소 8자 이상이어야 합니다.")
    private String password;

    @NotBlank(message = "닉네임은 필수 입력 항목입니다.")
    @Size(min = 2, max = 15, message = "닉네임은 2자 이상 15자 이하로 입력해주세요.")
    private String nickname;

    private Role role = Role.USER;

    // Profile-related fields
    @NotBlank(message = "이름은 필수 입력 항목입니다.")
    private String realName;

    @NotNull(message = "생년월일은 필수 입력 항목입니다.")
    private LocalDate birthdate;

    @NotNull(message = "성별은 필수 선택 항목입니다.")
    private Gender gender;

    @Size(max = 150, message = "자기소개는 최대 150자까지 입력 가능합니다.")
    private String bio;

    private String preferredDestinations;

    @NotNull
    private Set<TravelStyle> travelStyles;
}
