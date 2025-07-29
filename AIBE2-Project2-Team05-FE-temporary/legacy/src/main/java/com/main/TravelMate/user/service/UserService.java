package com.main.TravelMate.user.service;

import com.main.TravelMate.common.s3.S3Service;
import com.main.TravelMate.profile.entity.Profile;
import com.main.TravelMate.profile.repository.ProfileRepository;
import com.main.TravelMate.user.dto.LoginRequestDto;
import com.main.TravelMate.user.dto.LoginResponseDto;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.main.TravelMate.common.jwt.JwtTokenProvider jwtTokenProvider;
    private final S3Service s3Service; // S3 서비스 주입

    @Transactional
    public void signup(SignupRequestDto request, MultipartFile profileImage) throws IOException {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }
        if (userRepository.existsByNickname(request.getNickname())) {
            throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
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

        // 2. 프로필 이미지 S3에 업로드
        String profileImageUrl = "";
        if (profileImage != null && !profileImage.isEmpty()) {
            profileImageUrl = s3Service.uploadFile(profileImage, "profile-images");
        }

        // 3. Profile 엔티티 생성 및 저장
        Profile profile = Profile.builder()
                .user(user)
                .realName(request.getRealName())
                .birthdate(request.getBirthdate())
                .gender(request.getGender())
                .bio(request.getBio())
                .preferredDestinations(request.getPreferredDestinations())
                .travelStyles(request.getTravelStyles())
                .profileImage(profileImageUrl)
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
