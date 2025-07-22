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
        return ResponseEntity.ok(new LoginResponseDto(jwt, user.getEmail(), user.getRole()));
    }
}