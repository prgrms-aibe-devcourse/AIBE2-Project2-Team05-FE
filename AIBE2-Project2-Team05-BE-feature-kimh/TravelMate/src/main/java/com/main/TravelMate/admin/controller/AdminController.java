package com.main.TravelMate.admin.controller;


import com.main.TravelMate.admin.dto.AdminLoginRequest;
import com.main.TravelMate.admin.dto.AdminLoginResponse;
import com.main.TravelMate.admin.dto.AdminSignupRequest;
import com.main.TravelMate.admin.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * 관리자 회원가입
     */
    @PostMapping("/signup")
    public ResponseEntity<String> signup(@RequestBody AdminSignupRequest request) {
        adminService.signup(request);
        return ResponseEntity.ok("관리자 회원가입 완료");
    }

    /**
     * 관리자 로그인
     */
    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(@RequestBody AdminLoginRequest request) {
        AdminLoginResponse response = adminService.login(request);
        return ResponseEntity.ok(response);
    }
}
