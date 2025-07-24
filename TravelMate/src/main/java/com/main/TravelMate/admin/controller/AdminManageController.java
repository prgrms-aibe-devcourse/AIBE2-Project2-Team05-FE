package com.main.TravelMate.admin.controller;

import com.main.TravelMate.admin.dto.ManageFeedRequest;
import com.main.TravelMate.admin.dto.ManageMatchingRequest;
import com.main.TravelMate.admin.dto.ManageReportRequest;
import com.main.TravelMate.admin.dto.ManageUserRequest;
import com.main.TravelMate.admin.entity.ManagedUser;
import com.main.TravelMate.admin.entity.ManagedTravelFeed;
import com.main.TravelMate.admin.dto.ManagedTravelFeedDto;
import com.main.TravelMate.admin.service.AdminManageService;
import com.main.TravelMate.feed.dto.AdminFeedDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.report.entity.Report;
import com.main.TravelMate.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage")
@RequiredArgsConstructor
public class AdminManageController {

    private final AdminManageService adminManageService;

    @PostMapping("/user")
    public ResponseEntity<String> manageUser(Authentication authentication,
                                             @RequestBody ManageUserRequest request) {
        // Authentication에서 이메일 추출 (더 안전한 방식)
        String adminEmail = authentication.getName();
        System.out.println("Admin email from authentication: " + adminEmail); // 디버깅 로그
        System.out.println("Request: " + request); // 디버깅 로그
        
        adminManageService.manageUser(adminEmail, request);
        return ResponseEntity.ok("유저 제재 처리 완료");
    }

    @PostMapping("/matching")
    public ResponseEntity<String> manageMatching(Authentication authentication,
                                                 @RequestBody ManageMatchingRequest request) {
        // Authentication에서 이메일 추출 (더 안전한 방식)
        String adminEmail = authentication.getName();
        System.out.println("=== 매칭 처리 디버깅 ===");
        System.out.println("Admin email from authentication: " + adminEmail);
        System.out.println("Authentication authorities: " + authentication.getAuthorities());
        System.out.println("Request: " + request);
        
        adminManageService.manageMatchingRequest(adminEmail, request);
        return ResponseEntity.ok("매칭 제재 처리 완료");
    }

    @PostMapping("/feed")
    public ResponseEntity<String> manageFeed(Authentication authentication,
                                             @RequestBody ManageFeedRequest request) {
        // Authentication에서 이메일 추출 (더 안전한 방식)
        String adminEmail = authentication.getName();
        System.out.println("=== 피드 관리 디버깅 ===");
        System.out.println("Admin email from authentication: " + adminEmail);
        System.out.println("Authentication authorities: " + authentication.getAuthorities());
        System.out.println("Request: " + request);
        
        adminManageService.manageFeed(adminEmail, request);
        return ResponseEntity.ok("피드 제재 처리 완료");
    }

    @PostMapping("/report")
    public ResponseEntity<String> manageReport(Authentication authentication,
                                               @RequestBody ManageReportRequest request) {
        // Authentication에서 이메일 추출 (더 안전한 방식)
        String adminEmail = authentication.getName();
        System.out.println("=== 신고 처리 디버깅 ===");
        System.out.println("Admin email from authentication: " + adminEmail);
        System.out.println("Authentication authorities: " + authentication.getAuthorities());
        System.out.println("Request: " + request);
        
        adminManageService.manageReport(adminEmail, request);
        return ResponseEntity.ok("신고 처리 완료");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminManageService.getAllUsers());
    }

    @GetMapping("/managed-users")
    public ResponseEntity<List<ManagedUser>> getManagedUsers() {
        return ResponseEntity.ok(adminManageService.getManagedUsers());
    }

    @GetMapping("/feeds")
    public ResponseEntity<List<AdminFeedDto>> getAllFeeds() {
        return ResponseEntity.ok(adminManageService.getAllFeeds());
    }

    // 관리된 피드 조회 엔드포인트 추가
    @GetMapping("/managed-feeds")
    public ResponseEntity<List<ManagedTravelFeedDto>> getManagedFeeds() {
        return ResponseEntity.ok(adminManageService.getManagedFeeds());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<Report>> getAllReports() {
        return ResponseEntity.ok(adminManageService.getAllReports());
    }

    @GetMapping("/reports/{reportId}")
    public ResponseEntity<Report> getReportDetail(@PathVariable Long reportId) {
        return ResponseEntity.ok(adminManageService.getReportDetail(reportId));
    }
}
