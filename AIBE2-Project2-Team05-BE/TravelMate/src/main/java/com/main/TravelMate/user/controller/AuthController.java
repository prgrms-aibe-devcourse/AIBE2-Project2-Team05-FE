package com.main.TravelMate.user.controller;


import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.dto.LoginRequestDto;
import com.main.TravelMate.user.dto.LoginResponseDto;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.user.service.GoogleOAuthService;
import com.main.TravelMate.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // CORS 명시적 허용
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final GoogleOAuthService googleOAuthService;

    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody @Valid SignupRequestDto request) {
        userService.signup(request);
        return ResponseEntity.ok("회원가입 성공");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@RequestBody @Valid LoginRequestDto request) {
        LoginResponseDto response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile")
    public ResponseEntity<String> getProfile(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok("인증된 사용자: " + userDetails.getUsername());
    }

    /**
     * 토큰 유효성 검증 엔드포인트
     * GET /api/auth/validate
     */
    @GetMapping("/validate")
    public ResponseEntity<String> validateToken(Authentication authentication) {
        // 이 엔드포인트에 도달했다는 것은 JWT 필터에서 토큰이 유효하다고 검증되었음을 의미
        if (authentication != null && authentication.isAuthenticated()) {
            CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
            return ResponseEntity.ok("토큰이 유효합니다. 사용자: " + userDetails.getUsername());
        } else {
            return ResponseEntity.status(401).body("토큰이 유효하지 않습니다.");
        }
    }

    /**
     * 현재 로그인한 사용자의 ID를 반환하는 엔드포인트
     * GET /api/auth/current-user-id
     */
    @GetMapping("/current-user-id")
    public ResponseEntity<Long> getCurrentUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(401).build();
        }
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(userDetails.getUserId());
    }

    /**
     * 이메일로 사용자 ID를 조회하는 엔드포인트
     * GET /api/auth/user-id-by-email?email={email}
     */
    @GetMapping("/user-id-by-email")
    public ResponseEntity<Long> getUserIdByEmail(@RequestParam String email) {
        User user = userRepository.findByEmail(email)
                .orElse(null);
        
        if (user == null) {
            return ResponseEntity.status(404).build();
        }
        
        return ResponseEntity.ok(user.getId());
    }


    @PostMapping("/oauth/google")
    public ResponseEntity<LoginResponseDto> googleLogin(@RequestParam String token) {
        String email = googleOAuthService.verifyIdTokenAndGetEmail(token);

        // 유저가 존재하는지 확인
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    // 없으면 자동 회원가입
                    User newUser = User.builder()
                            .email(email)
                            .password("GOOGLE") // 구글 로그인은 비번 없음
                            .nickname(email.split("@")[0])
                            .role(Role.USER)
                            .build();
                    return userRepository.save(newUser);
                });

        // JWT 발급
        String jwt = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new LoginResponseDto(jwt, user.getEmail(), user.getNickname(), user.getRole(), user.getId()));
    }
}