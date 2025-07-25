package com.main.TravelMate.admin.controller;

import com.main.TravelMate.admin.dto.ManageFeedRequest;
import com.main.TravelMate.admin.dto.ManageMatchingRequest;
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
    public ResponseEntity<String> manageUser(@AuthenticationPrincipal String adminEmail,
                                             @RequestBody ManageUserRequest request) {
        adminManageService.manageUser(adminEmail, request);
        return ResponseEntity.ok("유저 제재 처리 완료");
    }

    @PostMapping("/matching")
    public ResponseEntity<String> manageMatching(@AuthenticationPrincipal String adminEmail,
                                                 @RequestBody ManageMatchingRequest request) {
        adminManageService.manageMatchingRequest(adminEmail, request);
        return ResponseEntity.ok("매칭 제재 처리 완료");
    }

    @PostMapping("/feed")
    public ResponseEntity<String> manageFeed(@AuthenticationPrincipal String adminEmail,
                                             @RequestBody ManageFeedRequest request) {
        adminManageService.manageFeed(adminEmail, request);
        return ResponseEntity.ok("피드 제재 처리 완료");
    }

    @PostMapping("/report")
    public ResponseEntity<String> manageReport(@AuthenticationPrincipal String adminEmail,
                                               @RequestBody ManageReportRequest request) {
        adminManageService.manageReport(adminEmail, request);
        return ResponseEntity.ok("신고 처리 완료");
    }

    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminManageService.getAllUsers());
    }

    @GetMapping("/feeds")
    public ResponseEntity<List<AdminFeedDto>> getAllFeeds() {
        return ResponseEntity.ok(adminManageService.getAllFeeds());
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
