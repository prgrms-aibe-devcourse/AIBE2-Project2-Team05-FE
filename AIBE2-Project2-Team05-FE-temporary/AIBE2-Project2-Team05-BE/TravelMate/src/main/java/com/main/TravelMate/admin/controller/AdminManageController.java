package com.main.TravelMate.admin.controller;

import com.main.TravelMate.admin.dto.AdminManagedFeedDto;
import com.main.TravelMate.admin.dto.AdminManagedUserDto;
import com.main.TravelMate.admin.dto.AdminUserDto;
import com.main.TravelMate.admin.dto.ManageFeedRequest;
import com.main.TravelMate.common.security.CustomAdminDetails;
// 임시 비활성화 - 매칭 기능 개발 중
// import com.main.TravelMate.admin.dto.ManageMatchingRequest;
import com.main.TravelMate.admin.dto.ManageReportRequest;
import com.main.TravelMate.admin.dto.ManageUserRequest;
import com.main.TravelMate.admin.service.AdminManageService;
import com.main.TravelMate.feed.dto.AdminFeedDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.report.entity.Report;
import com.main.TravelMate.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/manage")
@RequiredArgsConstructor
public class AdminManageController {

    private final AdminManageService adminManageService;

    @PostMapping("/user")
    public ResponseEntity<String> manageUser(@AuthenticationPrincipal CustomAdminDetails adminDetails,
                                             @RequestBody ManageUserRequest request) {
        adminManageService.manageUser(adminDetails.getUsername(), request);
        return ResponseEntity.ok("유저 제재 처리 완료");
    }

    // 임시 비활성화 - 매칭 기능 개발 중
    /*
    @PostMapping("/matching")
    public ResponseEntity<String> manageMatching(@AuthenticationPrincipal String adminEmail,
                                                 @RequestBody ManageMatchingRequest request) {
        adminManageService.manageMatchingRequest(adminEmail, request);
        return ResponseEntity.ok("매칭 제재 처리 완료");
    }
    */

    @PostMapping("/feed")
    public ResponseEntity<String> manageFeed(@AuthenticationPrincipal CustomAdminDetails adminDetails,
                                             @RequestBody ManageFeedRequest request) {
        adminManageService.manageFeed(adminDetails.getUsername(), request);
        return ResponseEntity.ok("피드 제재 처리 완료");
    }

    // ✅ 피드 관리 상태 해제 API 추가
    @PostMapping("/feed/restore")
    public ResponseEntity<String> restoreFeed(@AuthenticationPrincipal CustomAdminDetails adminDetails,
                                             @RequestParam Long feedId) {
        adminManageService.restoreFeed(adminDetails.getUsername(), feedId);
        return ResponseEntity.ok("피드 상태 해제 완료");
    }
    
    /**
     * 관리자가 모든 여행 계획 조회 (피드 모달용)
     * GET /api/admin/manage/travel-plan/{id}
     */
    @GetMapping("/travel-plan/{id}")
    public ResponseEntity<?> getTravelPlanForAdmin(@AuthenticationPrincipal CustomAdminDetails adminDetails,
                                                  @PathVariable Long id) {
        try {
            return adminManageService.getTravelPlanForAdmin(id)
                    .map(ResponseEntity::ok)
                    .orElse(ResponseEntity.notFound().build());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("여행 계획 조회 실패: " + e.getMessage());
        }
    }

    @PostMapping("/report")
    public ResponseEntity<String> manageReport(@AuthenticationPrincipal CustomAdminDetails adminDetails,
                                               @RequestBody ManageReportRequest request) {
        adminManageService.manageReport(adminDetails.getUsername(), request);
        return ResponseEntity.ok("신고 처리 완료");
    }

    @GetMapping("/users")
    public ResponseEntity<List<AdminUserDto>> getAllUsers() {
        return ResponseEntity.ok(adminManageService.getAllUsers());
    }

    @GetMapping("/feeds")
    public ResponseEntity<List<AdminFeedDto>> getAllFeeds() {
        return ResponseEntity.ok(adminManageService.getAllFeeds());
    }

    @GetMapping("/managed-feeds")
    public ResponseEntity<List<AdminManagedFeedDto>> getManagedFeeds() {
        return ResponseEntity.ok(adminManageService.getManagedFeeds());
    }

    @GetMapping("/managed-users")
    public ResponseEntity<List<AdminManagedUserDto>> getManagedUsers() {
        return ResponseEntity.ok(adminManageService.getManagedUsers());
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
