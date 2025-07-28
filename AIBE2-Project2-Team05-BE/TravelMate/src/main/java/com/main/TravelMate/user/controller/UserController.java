package com.main.TravelMate.user.controller;

import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.dto.PasswordChangeRequestDto;
import com.main.TravelMate.user.dto.UserSearchResponseDto;
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

    /**
     * 비밀번호 변경 API
     */
    @PutMapping("/change-password")
    public ResponseEntity<?> changePassword(
            @RequestBody PasswordChangeRequestDto request, 
            HttpServletRequest httpRequest) {
        
        try {
            // 토큰에서 이메일 추출
            String bearerToken = httpRequest.getHeader("Authorization");
            String token = bearerToken != null && bearerToken.startsWith("Bearer ")
                    ? bearerToken.substring(7)
                    : null;

            if (token == null) {
                return ResponseEntity.badRequest().body("인증 토큰이 없습니다");
            }

            String email = jwtTokenProvider.getEmail(token);

            // 새 비밀번호 확인 검증
            if (!request.getNewPassword().equals(request.getNewPasswordConfirm())) {
                return ResponseEntity.badRequest().body("새 비밀번호와 확인 비밀번호가 일치하지 않습니다");
            }

            // 비밀번호 변경 서비스 호출
            userService.changePassword(email, request.getCurrentPassword(), request.getNewPassword());
            
            log.info("비밀번호 변경 성공 - 사용자: {}", email);
            return ResponseEntity.ok("비밀번호가 성공적으로 변경되었습니다");

        } catch (Exception e) {
            log.error("비밀번호 변경 실패:", e);
            return ResponseEntity.badRequest().body("비밀번호 변경 실패: " + e.getMessage());
        }
    }

    /**
     * 채팅용 사용자 검색 API
     * 닉네임으로 사용자를 검색합니다.
     * 
     * @param nickname 검색할 닉네임 (부분 일치)
     * @return 검색된 사용자 리스트 (최대 10명)
     */
    @GetMapping("/search")
    public ResponseEntity<?> searchUsers(@RequestParam(value = "nickname", required = false) String nickname) {
        try {
            log.info("사용자 검색 API 호출 - 닉네임: {}", nickname);
            
            // 검색어가 비어있으면 빈 리스트 반환
            if (nickname == null || nickname.trim().isEmpty()) {
                return ResponseEntity.ok(List.of());
            }
            
            // 사용자 검색 서비스 호출
            List<UserSearchResponseDto> searchResults = userService.searchUsersByNickname(nickname);
            
            log.info("사용자 검색 완료 - 검색어: {}, 결과 수: {}", nickname, searchResults.size());
            return ResponseEntity.ok(searchResults);
            
        } catch (Exception e) {
            log.error("사용자 검색 실패: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().body("사용자 검색 중 오류가 발생했습니다: " + e.getMessage());
        }
    }

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TravelPlan> travelPlans = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.REMOVE, orphanRemoval = true)
    private List<TravelFeed> travelFeeds = new ArrayList<>();
}
