package com.main.TravelMate.admin.service;

import com.main.TravelMate.admin.dto.ManageFeedRequest;
import com.main.TravelMate.admin.dto.ManageMatchingRequest;
import com.main.TravelMate.admin.dto.ManageReportRequest;
import com.main.TravelMate.admin.dto.ManageUserRequest;
import com.main.TravelMate.admin.entity.*;
import com.main.TravelMate.admin.repository.*;
import com.main.TravelMate.feed.dto.AdminFeedDto;
import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.matching.entity.MatchingRequest;
import com.main.TravelMate.matching.repository.MatchingRequestRepository;
import com.main.TravelMate.report.entity.Report;
import com.main.TravelMate.report.repository.ReportRepository;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.user.entity.User;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AdminManageService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ManagedUserRepository managedUserRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    private final MatchingRequestRepository matchingRequestRepository;
    private final ManagedMatchingRequestRepository managedMatchingRequestRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final ManagedTravelFeedRepository managedTravelFeedRepository;
    private final ReportRepository reportRepository;

    @Transactional
    public void manageUser(String adminEmail, ManageUserRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 유저입니다."));
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        ManagedUser managed = managedUserRepository.findByUserId(user.getId())
                .orElse(new ManagedUser());

        managed.setUser(user);
        managed.setAdmin(admin);
        managed.setStatus(request.getStatus());
        managed.setReason(request.getReason());
        managed.setUpdatedAt(LocalDateTime.now());
        managedUserRepository.save(managed);

        AdminActionLog log = AdminActionLog.builder()
                .admin(admin)
                .actionType("USER_" + request.getStatus())
                .targetEntityType("user")
                .targetEntityId(user.getId())
                .actionDetails(request.getReason())
                .createdAt(LocalDateTime.now())
                .build();
        adminActionLogRepository.save(log);
    }



    @Transactional
    public void manageMatchingRequest(String adminEmail, ManageMatchingRequest request) {
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        MatchingRequest matching = matchingRequestRepository.findById(request.getMatchingId())
                .orElseThrow(() -> new IllegalArgumentException("매칭 요청 없음"));

        ManagedMatchingRequest managed = managedMatchingRequestRepository.findByMatchingId(matching.getId())
                .orElse(new ManagedMatchingRequest());

        managed.setMatching(matching);
        managed.setAdmin(admin);
        managed.setStatus(request.getStatus());
        managed.setNotes(request.getNotes());
        managed.setUpdatedAt(LocalDateTime.now());
        managedMatchingRequestRepository.save(managed);

        adminActionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .actionType("MATCHING_" + request.getStatus())
                .targetEntityType("matching_request")
                .targetEntityId(matching.getId())
                .actionDetails(request.getNotes())
                .createdAt(LocalDateTime.now())
                .build());
    }


    @Transactional
    public void manageFeed(String adminEmail, ManageFeedRequest request) {
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        TravelFeed feed = travelFeedRepository.findById(request.getTravelFeedId())
                .orElseThrow(() -> new IllegalArgumentException("해당 피드 없음"));

        ManagedTravelFeed managed = managedTravelFeedRepository.findByTravelFeedId(feed.getId())
                .orElse(new ManagedTravelFeed());

        managed.setTravelFeed(feed);
        managed.setAdmin(admin);
        managed.setStatus(request.getStatus());
        managed.setReason(request.getReason());
        managed.setUpdatedAt(LocalDateTime.now());
        managedTravelFeedRepository.save(managed);

        adminActionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .actionType("FEED_" + request.getStatus())
                .targetEntityType("travel_feed")
                .targetEntityId(feed.getId())
                .actionDetails(request.getReason())
                .createdAt(LocalDateTime.now())
                .build());
    }



    @Transactional
    public void manageReport(String adminEmail, ManageReportRequest request) {
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        Report report = reportRepository.findById(request.getReportId())
                .orElseThrow(() -> new IllegalArgumentException("신고 항목 없음"));

        report.setStatus(request.getStatus());
        report.setActionTaken(request.getActionTaken());
        report.setReviewedByAdminId(admin.getId());
        report.setReviewedAt(LocalDateTime.now());

        reportRepository.save(report);

        adminActionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .actionType("REPORT_" + request.getStatus())
                .targetEntityType("report")
                .targetEntityId(report.getId())
                .actionDetails("조치: " + request.getActionTaken())
                .createdAt(LocalDateTime.now())
                .build());
    }

    public List<User> getAllUsers() {
        return userRepository.findAll(); // 사용자 전체 조회
    }

    public List<AdminFeedDto> getAllFeeds() {
        return travelFeedRepository.findAll().stream()
                .map(AdminFeedDto::new)
                .toList();
    }

    public List<Report> getAllReports() {
        return reportRepository.findAll();
    }

    public Report getReportDetail(Long reportId) {
        return reportRepository.findById(reportId)
                .orElseThrow(() -> new EntityNotFoundException("신고를 찾을 수 없습니다."));
    }
}
