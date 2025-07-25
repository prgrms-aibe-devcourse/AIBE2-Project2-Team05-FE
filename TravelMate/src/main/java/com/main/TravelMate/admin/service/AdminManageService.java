package com.main.TravelMate.admin.service;

import com.main.TravelMate.admin.dto.ManageFeedRequest;
import com.main.TravelMate.admin.dto.ManageMatchingRequest;
import com.main.TravelMate.admin.dto.ManageReportRequest;
import com.main.TravelMate.admin.dto.ManageUserRequest;
import com.main.TravelMate.admin.dto.ManagedTravelFeedDto;
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
import com.main.TravelMate.user.domain.UserStatus;
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

        // 1. User 테이블의 status 업데이트 (우선순위 높음)
        UserStatus userStatus = convertToUserStatus(request.getStatus());
        if (userStatus != null) {
            user.setStatus(userStatus);
            userRepository.save(user);
        }

        // 2. ManagedUser 테이블에도 기록 (부가 정보 및 로그용)
        ManagedUser managed = managedUserRepository.findByUserId(user.getId())
                .orElse(new ManagedUser());

        managed.setUser(user);
        managed.setAdmin(admin);
        managed.setStatus(request.getStatus());
        managed.setReason(request.getReason());
        managed.setUpdatedAt(LocalDateTime.now());
        managedUserRepository.save(managed);

        // 3. 관리자 액션 로그 기록
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

    /**
     * 관리자 요청의 status 문자열을 UserStatus ENUM으로 변환
     * @param status 관리자가 설정한 상태 문자열
     * @return 대응되는 UserStatus ENUM 값
     */
    private UserStatus convertToUserStatus(String status) {
        if (status == null) return null;
        
        switch (status.toUpperCase()) {
            case "ACTIVE":
                return UserStatus.ACTIVE;
            case "BLOCKED":
            case "BANNED":
                return UserStatus.BANNED;
            case "INACTIVE":
            case "DELETED_BY_ADMIN":
                return UserStatus.INACTIVE;
            default:
                // 알 수 없는 상태는 null 반환 (User 테이블 업데이트 안 함)
                return null;
        }
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

    public List<ManagedUser> getManagedUsers() {
        // 삭제된 사용자의 managed_user 레코드 정리
        cleanupDeletedUserRecords();
        return managedUserRepository.findAllWithValidUsers(); // 삭제되지 않은 사용자만 조회
    }
    
    /**
     * 삭제된 사용자의 managed_user 레코드를 정리하는 메서드
     */
    @Transactional
    public void cleanupDeletedUserRecords() {
        List<ManagedUser> allManagedUsers = managedUserRepository.findAll();
        
        for (ManagedUser managedUser : allManagedUsers) {
            if (managedUser.getUser() == null) {
                // User가 null인 경우 (삭제된 사용자) 레코드 삭제
                managedUserRepository.delete(managedUser);
                System.out.println("삭제된 사용자의 managed_user 레코드 정리: ID " + managedUser.getId());
            }
        }
    }

    public List<AdminFeedDto> getAllFeeds() {
        return travelFeedRepository.findAll().stream()
                .map(AdminFeedDto::new)
                .toList();
    }

    // 관리된 피드 조회 메서드 추가 (DTO 사용하여 LAZY 로딩 문제 해결)
    @Transactional
    public List<ManagedTravelFeedDto> getManagedFeeds() {
        // 삭제된 피드의 managed_travel_feed 레코드 정리
        cleanupDeletedFeedRecords();
        
        List<ManagedTravelFeed> managedFeeds = managedTravelFeedRepository.findAll();
        
        return managedFeeds.stream()
                .filter(managedFeed -> managedFeed.getTravelFeed() != null) // null 체크 추가
                .map(managedFeed -> {
                    try {
                        // LAZY 로딩된 연관 엔티티들을 강제로 로드
                        managedFeed.getTravelFeed().getUser().getNickname(); // User 정보 로드
                        managedFeed.getAdmin().getName(); // Admin 정보 로드
                        
                        return new ManagedTravelFeedDto(managedFeed);
                    } catch (Exception e) {
                        // 로딩 중 오류가 발생하면 해당 레코드 제외
                        System.out.println("피드 데이터 로딩 오류: " + e.getMessage());
                        return null;
                    }
                })
                .filter(dto -> dto != null) // null 값 제거
                .toList();
    }
    
    /**
     * 삭제된 피드의 managed_travel_feed 레코드를 정리하는 메서드
     */
    @Transactional
    public void cleanupDeletedFeedRecords() {
        List<ManagedTravelFeed> allManagedFeeds = managedTravelFeedRepository.findAll();
        
        for (ManagedTravelFeed managedFeed : allManagedFeeds) {
            if (managedFeed.getTravelFeed() == null) {
                // TravelFeed가 null인 경우 (삭제된 피드) 레코드 삭제
                managedTravelFeedRepository.delete(managedFeed);
                System.out.println("삭제된 피드의 managed_travel_feed 레코드 정리: ID " + managedFeed.getId());
            }
        }
    }

    public List<Report> getAllReports() {
        // JOIN FETCH를 사용하여 User 정보를 함께 로드
        return reportRepository.findAllWithUsers();
    }

    public Report getReportDetail(Long reportId) {
        // JOIN FETCH를 사용하여 User 정보를 함께 로드
        return reportRepository.findByIdWithUsers(reportId)
                .orElseThrow(() -> new EntityNotFoundException("신고를 찾을 수 없습니다."));
    }
}
