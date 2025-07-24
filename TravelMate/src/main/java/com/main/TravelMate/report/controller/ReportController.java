package com.main.TravelMate.report.controller;

import com.main.TravelMate.report.dto.CreateReportRequest;
import com.main.TravelMate.report.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @PostMapping
    public ResponseEntity<String> reportUser(@AuthenticationPrincipal UserDetails userDetails,
                                             @RequestBody CreateReportRequest request) {
        // UserDetails에서 이메일(username) 추출
        String reporterEmail = userDetails.getUsername();
        reportService.createReport(reporterEmail, request);
        return ResponseEntity.ok("신고가 접수되었습니다.");
    }
}
