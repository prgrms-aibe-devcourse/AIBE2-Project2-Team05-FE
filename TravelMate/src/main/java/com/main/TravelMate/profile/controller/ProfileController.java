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
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
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
    // 프로필 이미지 업로드 API
    @PostMapping("/upload-image")
    public ResponseEntity<String> uploadProfileImage(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestParam("image") MultipartFile image) {
        try {
            String imageUrl = profileService.uploadProfileImage(userDetails.getUser().getId(), image);
            return ResponseEntity.ok(imageUrl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이미지 업로드 실패: " + e.getMessage());
        }
    }

    // 이미지 파일 서빙 API
    @GetMapping("/images/profile/{filename}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        try {
            Path filePath = Paths.get("uploads/profile-images/" + filename);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                // 파일 확장자에 따라 적절한 Content-Type 설정
                String contentType = "image/jpeg"; // 기본값
                if (filename.toLowerCase().endsWith(".png")) {
                    contentType = "image/png";
                } else if (filename.toLowerCase().endsWith(".gif")) {
                    contentType = "image/gif";
                } else if (filename.toLowerCase().endsWith(".webp")) {
                    contentType = "image/webp";
                }
                
                return ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType(contentType))
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/follow/{targetId}")
    public ResponseEntity<String> follow(@AuthenticationPrincipal CustomUserDetails userDetails,
                                         @PathVariable Long targetId) {
        profileService.follow(userDetails.getUser().getId(), targetId);
        return ResponseEntity.ok("팔로우 성공");
    }

    @DeleteMapping("/unfollow/{targetId}")
    public ResponseEntity<String> unfollow(@PathVariable Long targetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
    public ResponseEntity<String> unfollow(@AuthenticationPrincipal CustomUserDetails userDetails,
                                           @PathVariable Long targetId) {
        profileService.unfollow(userDetails.getUser().getId(), targetId);
        return ResponseEntity.ok("언팔로우 성공");
    }
}
