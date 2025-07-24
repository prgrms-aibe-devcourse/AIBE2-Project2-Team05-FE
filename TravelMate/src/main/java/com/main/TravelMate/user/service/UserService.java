package com.main.TravelMate.user.service;


import com.main.TravelMate.admin.entity.ManagedUser;
import com.main.TravelMate.admin.repository.ManagedUserRepository;
import com.main.TravelMate.user.domain.UserStatus;
import com.main.TravelMate.user.dto.LoginRequestDto;
import com.main.TravelMate.user.dto.LoginResponseDto;
import com.main.TravelMate.user.dto.SignupRequestDto;
import com.main.TravelMate.user.entity.User;
import com.main.TravelMate.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final ManagedUserRepository managedUserRepository; // ManagedUser 레포지토리 추가
    private final PasswordEncoder passwordEncoder;
    private final com.main.TravelMate.common.jwt.JwtTokenProvider jwtTokenProvider;

    public void signup(SignupRequestDto request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("이미 가입된 이메일입니다.");
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .nickname(request.getNickname())
                .role(request.getRole())
                .status(UserStatus.ACTIVE) // 신규 사용자는 기본적으로 ACTIVE 상태
                .createdAt(LocalDateTime.now())
                .build();

        userRepository.save(user);
    }

    public LoginResponseDto login(LoginRequestDto request) {
        // 1. 사용자 정보 확인
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("이메일 없음"));

        // 2. 비밀번호 확인
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BadCredentialsException("비밀번호 불일치");
        }

        // 3. 먼저 User 테이블의 status 확인 (우선순위)
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

        // 4. 추가로 ManagedUser 테이블에서 관리자 설정 상태 확인 (부가 검증)
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

        // 5. 모든 검증을 통과한 경우 JWT 토큰 생성
        String token = jwtTokenProvider.createToken(user.getEmail(), user.getRole());
        return new LoginResponseDto(token, user.getEmail(), user.getRole());
    }


    @Transactional
    public void delete(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("사용자 없음"));
        userRepository.delete(user);
    }


}
