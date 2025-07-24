package com.main.TravelMate.profile.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.profile.dto.ProfileResponseDto;
import com.main.TravelMate.profile.dto.ProfileUpdateRequestDto;
import com.main.TravelMate.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
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

    private final ProfileService profileService;

    @GetMapping("/{userId}")
    public ResponseEntity<ProfileResponseDto> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.getProfile(userId));

    }

    @PutMapping
    public ResponseEntity<String> updateProfile(
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProfileUpdateRequestDto request) {
        profileService.updateProfile(userDetails.getUser().getId(), request);
        return ResponseEntity.ok("프로필이 저장되었습니다.");
    }

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
    public ResponseEntity<String> unfollow(@AuthenticationPrincipal CustomUserDetails userDetails,
                                           @PathVariable Long targetId) {
        profileService.unfollow(userDetails.getUser().getId(), targetId);
        return ResponseEntity.ok("언팔로우 성공");
    }
}
