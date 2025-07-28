package com.main.TravelMate.user.service;


import com.main.TravelMate.common.service.FileUploadService;
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
import java.util.Set;
import java.util.HashSet;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {
    private final UserRepository userRepository;
    private final ProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final com.main.TravelMate.common.jwt.JwtTokenProvider jwtTokenProvider;
    private final FileUploadService fileUploadService;

    /**
     * 기본 회원가입 (기존 호환성 유지)
     */
    public void signup(SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(request.getRole())
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    /**
     * 확장된 회원가입 (프로필 정보 + 파일 업로드 포함)
     */
    @Transactional
    public void signup(SignupRequestDto request, MultipartFile profileImage) throws IOException {
        try {
            log.info("회원가입 시작 - 이메일: {}", request.getEmail());
            
            // 중복 검사
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new IllegalArgumentException("이미 가입된 이메일입니다.");
            }
            if (userRepository.existsByNickname(request.getNickname())) {
                throw new IllegalArgumentException("이미 사용 중인 닉네임입니다.");
            }

            // travelStyles null 체크 및 기본값 설정
            if (request.getTravelStyles() == null || request.getTravelStyles().isEmpty()) {
                log.debug("여행 스타일이 비어있음 - 빈 Set으로 설정");
                request.setTravelStyles(Set.of());
            }

            // 1. User 엔티티 생성 및 저장
            User user = User.builder()
                    .email(request.getEmail())
                    .password(passwordEncoder.encode(request.getPassword()))
                    .nickname(request.getNickname())
                    .role(request.getRole())
                    .createdAt(LocalDateTime.now())
                    .build();
            
            // ✅ saveAndFlush()로 즉시 DB에 반영하여 ID 생성
            user = userRepository.saveAndFlush(user);
            
            log.info("User 저장 완료 - ID: {}", user.getId());

            // 2. 프로필 이미지 업로드
            String profileImageUrl = null;
            if (profileImage != null && !profileImage.isEmpty()) {
                log.debug("프로필 이미지 업로드 시작: {}", profileImage.getOriginalFilename());
                try {
                    if (fileUploadService.validateFile(profileImage)) {
                        profileImageUrl = fileUploadService.uploadFile(profileImage, "profile-images");
                        log.debug("이미지 업로드 완료: {}", profileImageUrl);
                    } else {
                        log.warn("유효하지 않은 이미지 파일: {}", profileImage.getOriginalFilename());
                        throw new IllegalArgumentException("유효하지 않은 이미지 파일입니다.");
                    }
                } catch (Exception e) {
                    log.error("이미지 업로드 실패: {}", e.getMessage());
                    throw new IOException("이미지 업로드 중 오류가 발생했습니다: " + e.getMessage());
                }
            }

            // 3. Profile 엔티티 생성 및 저장 (방어적 처리)
            Profile profile = Profile.builder()
                    .user(user)
                    .realName(request.getRealName() != null ? request.getRealName().trim() : "")
                    .birthdate(request.getBirthdate())
                    .gender(request.getGender())
                    .bio(request.getBio() != null ? request.getBio().trim() : "")
                    .preferredDestinations(request.getPreferredDestinations() != null ? request.getPreferredDestinations().trim() : "")
                    .residence(request.getResidence() != null ? request.getResidence().trim() : "") // 🏠 거주지 추가
                    .travelStyles(request.getTravelStyles() != null ? request.getTravelStyles() : new HashSet<>())
                    .profileImage(profileImageUrl)
                    .build();
                    
            profileRepository.save(profile);
            
            log.info("회원가입 완료: {}", request.getEmail());
            
        } catch (Exception e) {
            log.error("회원가입 실패: {}", e.getMessage(), e);
            throw e;
        }
    }

    public LoginResponseDto login(LoginRequestDto request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("이메일 없음"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("비밀번호 불일치");
        }

        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return new LoginResponseDto(token, user.getEmail(), user.getNickname(), user.getRole());
    }

    @Transactional
    public void delete(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        userRepository.delete(user);
    }

    /**
     * 비밀번호 변경
     */
    @Transactional
    public void changePassword(String email, String currentPassword, String newPassword) {
        // 사용자 조회
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("사용자를 찾을 수 없습니다"));
        
        // 현재 비밀번호 확인
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new BadCredentialsException("현재 비밀번호가 일치하지 않습니다");
        }
        
        // 새 비밀번호 암호화 후 저장
        user.updatePassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        
        log.info("비밀번호 변경 완료 - 사용자: {}", email);
    }
}
