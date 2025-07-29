package com.main.TravelMate.admin.service;

import com.main.TravelMate.admin.dto.AdminLoginRequest;
import com.main.TravelMate.admin.dto.AdminLoginResponse;
import com.main.TravelMate.admin.dto.AdminSignupRequest;
import com.main.TravelMate.admin.entity.Admin;
import com.main.TravelMate.admin.repository.AdminRepository;
import com.main.TravelMate.common.jwt.JwtTokenProvider;
import com.main.TravelMate.user.domain.Role;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    /**
     * 관리자 회원가입
     */
    public void signup(AdminSignupRequest request) {
        if (adminRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("이미 존재하는 이메일입니다.");
        }

        Admin admin = Admin.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        adminRepository.save(admin);
    }

    /**
     * 관리자 로그인
     */
    public AdminLoginResponse login(AdminLoginRequest request) {
        System.out.println("🔍 [관리자 로그인] 요청 이메일: " + request.getEmail());
        
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> {
                    System.out.println("❌ [관리자 로그인] 존재하지 않는 관리자: " + request.getEmail());
                    return new IllegalArgumentException("존재하지 않는 관리자입니다.");
                });

        System.out.println("✅ [관리자 로그인] 관리자 찾음: " + admin.getEmail());
        System.out.println("🔍 [관리자 로그인] 입력 비밀번호: " + request.getPassword());
        System.out.println("🔍 [관리자 로그인] 저장된 비밀번호: " + admin.getPassword());

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            System.out.println("❌ [관리자 로그인] 비밀번호 불일치");
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        System.out.println("✅ [관리자 로그인] 비밀번호 일치");
        String token = jwtTokenProvider.createToken(admin.getEmail(), Role.ADMIN);
        System.out.println("✅ [관리자 로그인] JWT 토큰 생성 완료");

        return new AdminLoginResponse(token, admin.getEmail(), admin.getName(), Role.ADMIN.name(), admin.getId());
    }
}
