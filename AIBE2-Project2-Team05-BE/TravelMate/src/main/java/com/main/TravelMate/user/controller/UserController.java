package com.main.TravelMate.user.controller;

import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.CascadeType;
import jakarta.persistence.OneToMany;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // CORS 명시적 허용
public class UserController {

    private final UserService userService;
    private final JwtTokenProvider jwtTokenProvider;
    private final ObjectMapper objectMapper;

    /**
     * 확장된 회원가입 API
     * 프로필 정보와 이미지 파일을 함께 받아 처리합니다.
     * 
     * @param signupRequestJson JSON 형태의 회원가입 정보
     * @param profileImage 프로필 이미지 파일 (선택적)
     * @return 회원가입 결과
     */
    @PostMapping("/signup")
    public ResponseEntity<?> signupWithProfile(
            @RequestPart("signupRequest") String signupRequestJson,
            @RequestPart(value = "profileImage", required = false) MultipartFile profileImage) {
        
        try {
            log.info("회원가입 요청 - 이미지: {}", profileImage != null ? profileImage.getOriginalFilename() : "없음");

            // JSON 문자열을 SignupRequestDto로 변환
            SignupRequestDto signupRequest;
            try {
                signupRequest = objectMapper.readValue(signupRequestJson, SignupRequestDto.class);
            } catch (Exception parseException) {
                log.error("JSON 파싱 실패: {}", parseException.getMessage());
                return ResponseEntity.badRequest().body("잘못된 요청 데이터 형식입니다: " + parseException.getMessage());
            }
            
            // 확장된 회원가입 처리
            userService.signup(signupRequest, profileImage);
            
            log.info("회원가입 성공: {}", signupRequest.getEmail());
            return ResponseEntity.ok().body("회원가입이 성공적으로 완료되었습니다.");
            
        } catch (IllegalArgumentException e) {
            log.warn("회원가입 실패 - 검증 오류: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
            
        } catch (Exception e) {
            log.error("회원가입 실패 - 시스템 오류: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("서버 내부 오류가 발생했습니다: " + e.getMessage());
        }
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
