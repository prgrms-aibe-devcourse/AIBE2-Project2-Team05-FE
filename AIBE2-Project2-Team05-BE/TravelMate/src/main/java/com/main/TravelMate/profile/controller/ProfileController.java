package com.main.TravelMate.profile.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.profile.dto.ProfileResponseDto;
import com.main.TravelMate.profile.dto.ProfileUpdateRequestDto;
import com.main.TravelMate.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // CORS 명시적 허용
public class ProfileController {
    
    private static final Logger log = LoggerFactory.getLogger(ProfileController.class);
    private final ProfileService profileService;

    /**
     * 현재 로그인한 사용자의 프로필 조회
     * GET /api/profile/me
     */
    @GetMapping("/me")
    public ResponseEntity<ProfileResponseDto> getMyProfile() {
        log.info("🚀 프로필 조회 요청 시작");
        
        try {
            // 인증 정보 확인
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) {
                log.error("❌ 인증 정보가 없습니다");
                return ResponseEntity.status(401).build();
            }
            
            if (!(auth.getPrincipal() instanceof CustomUserDetails)) {
                log.error("❌ Principal이 CustomUserDetails 타입이 아닙니다: {}", auth.getPrincipal().getClass());
                return ResponseEntity.status(401).build();
            }
            
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            Long userId = userDetails.getUser().getId();
            
            log.info("📋 인증된 사용자 정보:");
            log.info("  - 사용자 ID: {}", userId);
            log.info("  - 닉네임: {}", userDetails.getUsername());
            log.info("  - 권한: {}", auth.getAuthorities());
            
            ProfileResponseDto profile = profileService.getProfile(userId);
            
            log.info("✅ 프로필 조회 성공:");
            log.info("  - 프로필 ID: {}", profile.getId());
            log.info("  - 닉네임: {}", profile.getNickname());
            log.info("  - 피드 수: {}", profile.getFeeds() != null ? profile.getFeeds().size() : 0);
            
            return ResponseEntity.ok(profile);
            
        } catch (Exception e) {
            log.error("❌ 프로필 조회 중 오류 발생: {}", e.getMessage(), e);
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));
    }

    /**
     * 닉네임으로 프로필 조회
     * GET /api/profile/user/{nickname}
     */
    @GetMapping("/user/{nickname}")
    public ResponseEntity<ProfileResponseDto> getProfileByNickname(@PathVariable String nickname) {
        log.info("🔍 닉네임으로 프로필 조회 요청: {}", nickname);
        
        try {
            ProfileResponseDto profile = profileService.getProfileByNickname(nickname);
            log.info("✅ 닉네임 프로필 조회 성공: {} → {}", nickname, profile.getNickname());
            return ResponseEntity.ok(profile);
        } catch (Exception e) {
            log.error("❌ 닉네임 프로필 조회 실패: {} - {}", nickname, e.getMessage());
            return ResponseEntity.notFound().build();
        }
    }

    /**
     * 임시 테스트용: 모든 사용자 목록 조회 (개발용)
     * GET /api/profile/test/users
     */
    @GetMapping("/test/users")
    public ResponseEntity<Object> getAllUsersForTest() {
        log.info("🔍 테스트용 사용자 목록 조회");
        
        try {
            List<Object> users = profileService.getAllUsersForTest();
            log.info("✅ 사용자 목록 조회 성공: {} 명", users.size());
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            log.error("❌ 사용자 목록 조회 실패: {}", e.getMessage());
            return ResponseEntity.status(500).body("사용자 목록 조회 실패: " + e.getMessage());
        }
    }

    /**
     * 특정 사용자의 기본 프로필 생성
     * POST /api/profile/create/{userId}
     */
    @PostMapping("/create/{userId}")
    public ResponseEntity<String> createDefaultProfile(@PathVariable Long userId) {
        log.info("🚀 사용자 ID {} 프로필 생성 요청", userId);
        
        try {
            profileService.createDefaultProfileForUser(userId);
            return ResponseEntity.ok("사용자 ID " + userId + "의 프로필이 생성되었습니다.");
        } catch (Exception e) {
            log.error("❌ 프로필 생성 실패: 사용자 ID {}, 오류: {}", userId, e.getMessage());
            return ResponseEntity.status(500).body("프로필 생성 실패: " + e.getMessage());
        }
    }

    /**
     * 모든 사용자의 기본 프로필 일괄 생성
     * POST /api/profile/create-all
     */
    @PostMapping("/create-all")
    public ResponseEntity<Object> createAllDefaultProfiles() {
        log.info("🚀 모든 사용자 프로필 일괄 생성 요청");
        
        try {
            Object result = profileService.createDefaultProfilesForAllUsers();
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            log.error("❌ 프로필 일괄 생성 실패: {}", e.getMessage());
            return ResponseEntity.status(500).body("프로필 일괄 생성 실패: " + e.getMessage());
        }
    }

    @PutMapping
    public ResponseEntity<String> updateProfile(@RequestBody ProfileUpdateRequestDto request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        profileService.updateProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok("프로필이 저장되었습니다.");
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<String> follow(@PathVariable Long targetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        profileService.follow(userDetails.getUser().getId(), targetId);
        return ResponseEntity.ok("팔로우 성공");
    }

    @DeleteMapping("/unfollow/{targetId}")
    public ResponseEntity<String> unfollow(@PathVariable Long targetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
        profileService.unfollow(userDetails.getUser().getId(), targetId);
        return ResponseEntity.ok("언팔로우 성공");
    }
}
