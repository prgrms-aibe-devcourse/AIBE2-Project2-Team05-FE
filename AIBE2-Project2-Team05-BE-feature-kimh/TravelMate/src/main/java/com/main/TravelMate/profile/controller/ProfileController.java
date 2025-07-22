package com.main.TravelMate.profile.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.profile.dto.ProfileResponseDto;
import com.main.TravelMate.profile.dto.ProfileUpdateRequestDto;
import com.main.TravelMate.profile.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

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
