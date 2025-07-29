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
        Admin admin = adminRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 관리자입니다."));

        if (!passwordEncoder.matches(request.getPassword(), admin.getPassword())) {
            throw new IllegalArgumentException("비밀번호가 틀렸습니다.");
        }

        String token = jwtTokenProvider.createToken(admin.getEmail(), Role.ADMIN);

        return new AdminLoginResponse(token);
    }
}
