package com.main.TravelMate.user.controller;

import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.user.service.UserService;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // 사용자 닉네임 검색 API - 현재 로그인한 사용자 제외
    @GetMapping("/search")
    public ResponseEntity<List<Map<String, Object>>> searchUsers(
            @RequestParam String keyword,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        // 빈 키워드 체크
        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(new ArrayList<>());
        }
        
        // 현재 로그인한 사용자 정보 가져오기 (final로 선언)
        final User currentUser;
        if (userDetails instanceof CustomUserDetails) {
            currentUser = ((CustomUserDetails) userDetails).getUser();
        } else {
            // 일반 UserDetails인 경우 이메일로 사용자 찾기
            String currentUserEmail = userDetails.getUsername();
            currentUser = userRepository.findByEmail(currentUserEmail).orElse(null);
        }
        
        // 키워드로 사용자 검색
        List<User> users = userRepository.findByNicknameContainingIgnoreCase(keyword.trim());
        
        // 응답용 데이터 변환 (비밀번호 등 민감 정보 제외)
        // 현재 로그인한 사용자는 검색 결과에서 제외
        List<Map<String, Object>> result = users.stream()
                .filter(user -> currentUser == null || !user.getId().equals(currentUser.getId())) // 현재 사용자 제외
                .map(user -> {
                    Map<String, Object> userInfo = new HashMap<>();
                    userInfo.put("id", user.getId());
                    userInfo.put("nickname", user.getNickname());
                    userInfo.put("email", user.getEmail());
                    return userInfo;
                })
                .toList();
        
        return ResponseEntity.ok(result);
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> deleteUser(HttpServletRequest request) {
        // 헤더에서 토큰 꺼내기
        String bearerToken = request.getHeader("Authorization");
        String token = bearerToken != null && bearerToken.startsWith("Bearer ")
                ? bearerToken.substring(7)
                : null;

        if (token == null) {
            return ResponseEntity.badRequest().body("토큰 없음");
        }

        String email = jwtTokenProvider.getEmail(token);  // ✅ 여기서 추출
        userService.delete(email);
        return ResponseEntity.ok("회원 탈퇴 완료");
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TravelPlan> travelPlans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TravelFeed> travelFeeds = new ArrayList<>();
}
