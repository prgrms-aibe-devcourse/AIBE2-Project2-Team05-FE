package com.main.TravelMate.user.service;


import com.main.TravelMate.user.dto.LoginRequestDto;
import com.main.TravelMate.user.dto.LoginResponseDto;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.profile.repository.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.main.TravelMate.common.jwt.JwtTokenProvider jwtTokenProvider;

    @Transactional
    public void signup(SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        // 1. User 엔티티 생성 및 저장
        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(request.getRole())
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);

        // 2. Profile 엔티티 생성 및 저장 (회원가입 시 전송받은 정보 사용)
        Profile profile = Profile.builder()
                .user(user)
                .realName(request.getRealName() != null ? request.getRealName() : "")
                .age(request.getAge() != null ? request.getAge() : 0)
                .gender(request.getGender() != null ? request.getGender() : "남성")
                .preferredDestinations(request.getPreferredDestinations() != null ? request.getPreferredDestinations() : "유럽")
                .travelStyle(request.getTravelStyle() != null ? request.getTravelStyle() : "계획적인 여행,관광 중심")
                .bio(request.getBio() != null ? request.getBio() : "자기소개를 입력해주세요.")
                .profileImage(request.getProfileImage()) // 프로필 이미지 URL 저장
                .build();

        profileRepository.save(profile);
    }

    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("이메일 없음"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("비밀번호 불일치");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return new LoginResponseDto(token, user.getEmail(), user.getRole());
    }


    @Transactional
    public void delete(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        userRepository.delete(user);
    }


}
