package com.main.TravelMate.user.controller;


import com.main.TravelMate.admin.repository.ManagedUserRepository;
import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.user.domain.Role;
import com.main.TravelMate.user.domain.UserStatus;
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
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ManagedUserRepository managedUserRepository; // ManagedUser 레포지토리 추가
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
                            .status(UserStatus.ACTIVE) // 신규 구글 사용자도 ACTIVE 상태
                            .build();
                    return userRepository.save(newUser);
                });

        // 먼저 User 테이블의 status 확인 (구글 로그인도 동일한 검증 적용)
        if (user.getStatus() != null) {
            switch (user.getStatus()) {
                case BANNED:
                    throw new BadCredentialsException("계정이 차단되었습니다. 관리자에게 문의하세요.");
                case INACTIVE:
                    throw new BadCredentialsException("계정이 비활성화되었습니다. 관리자에게 문의하세요.");
                case ACTIVE:
                    // 정상 상태이므로 계속 진행
                    break;
            }
        }

        // 추가로 ManagedUser 테이블에서 관리자 설정 상태 확인 (부가 검증)
        managedUserRepository.findByUserId(user.getId())
                .ifPresent(managedUser -> {
                    String managedStatus = managedUser.getStatus();
                    
                    // 관리자가 별도로 설정한 상태 확인
                    if ("BLOCKED".equals(managedStatus) || "BANNED".equals(managedStatus)) {
                        String reason = managedUser.getReason() != null ? managedUser.getReason() : "관리자에 의해 제한되었습니다.";
                        throw new BadCredentialsException("계정 접근이 제한되었습니다. 사유: " + reason);
                    }
                    
                    if ("DELETED_BY_ADMIN".equals(managedStatus)) {
                        throw new BadCredentialsException("계정이 관리자에 의해 삭제되었습니다.");
                    }
                    
                    if ("INACTIVE".equals(managedStatus)) {
                        throw new BadCredentialsException("계정이 관리자에 의해 비활성화되었습니다.");
                    }
                });

        // JWT 발급
        String jwt = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return ResponseEntity.ok(new LoginResponseDto(jwt, user.getEmail(), user.getRole()));
    }
}