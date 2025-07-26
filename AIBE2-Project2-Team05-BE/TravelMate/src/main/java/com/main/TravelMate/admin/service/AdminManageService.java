package com.main.TravelMate.admin.service;

import com.main.TravelMate.admin.dto.AdminManagedFeedDto;
import com.main.TravelMate.admin.dto.AdminUserDto;
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
import com.main.TravelMate.plan.dto.TravelPlanResponseDto;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.plan.repository.TravelPlanRepository;
import com.main.TravelMate.report.entity.Report;
import com.main.TravelMate.report.repository.ReportRepository;
import com.main.TravelMate.user.repository.UserRepository;
import com.main.TravelMate.user.entity.User;
import jakarta.annotation.PostConstruct;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AdminManageService {

    private final UserRepository userRepository;
    private final AdminRepository adminRepository;
    private final ManagedUserRepository managedUserRepository;
    private final AdminActionLogRepository adminActionLogRepository;
    // 임시 비활성화 - 매칭 기능 개발 중
    // private final MatchingRequestRepository matchingRequestRepository;
    // private final ManagedMatchingRequestRepository managedMatchingRequestRepository;
    private final TravelFeedRepository travelFeedRepository;
    private final ManagedTravelFeedRepository managedTravelFeedRepository;
    private final ReportRepository reportRepository;
    private final TravelPlanRepository travelPlanRepository;

    // ✅ 애플리케이션 시작 시 기존 피드 데이터 초기화
    @PostConstruct
    @Transactional
    public void initializeFeedStatus() {
        try {
            List<TravelFeed> feedsWithNullStatus = travelFeedRepository.findAll().stream()
                    .filter(feed -> feed.getStatus() == null || feed.getStatus().trim().isEmpty())
                    .toList();
            
            if (!feedsWithNullStatus.isEmpty()) {
                System.out.println("=== 피드 Status 초기화 ===");
                System.out.println("NULL/빈 status를 가진 피드 수: " + feedsWithNullStatus.size());
                
                for (TravelFeed feed : feedsWithNullStatus) {
                    feed.setStatus("ACTIVE");
                    System.out.println("피드 ID " + feed.getId() + " status를 ACTIVE로 설정");
                }
                
                travelFeedRepository.saveAll(feedsWithNullStatus);
                System.out.println("피드 status 초기화 완료!");
            }
        } catch (Exception e) {
            System.err.println("피드 status 초기화 중 오류 발생: " + e.getMessage());
        }
    }

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

    // 임시 비활성화 - 매칭 기능 개발 중
    /*
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
    */


    @Transactional
    public void manageFeed(String adminEmail, ManageFeedRequest request) {
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        TravelFeed feed = travelFeedRepository.findById(request.getTravelFeedId())
                .orElseThrow(() -> new IllegalArgumentException("해당 피드 없음"));

        // ✅ 피드 상태를 요청에 따라 정확히 설정
        String newStatus;
        if ("HIDDEN".equals(request.getStatus())) {
            newStatus = "DEACTIVE";
        } else if ("DELETED_BY_ADMIN".equals(request.getStatus())) {
            newStatus = "DELETED";
        } else {
            newStatus = "DEACTIVE"; // 기본값
        }
        
        feed.setStatus(newStatus);
        travelFeedRepository.save(feed);
        
        System.out.println("=== 피드 관리 처리 ===");
        System.out.println("피드 ID: " + feed.getId());
        System.out.println("요청 상태: " + request.getStatus());
        System.out.println("실제 DB 상태: " + newStatus);

        ManagedTravelFeed managed = managedTravelFeedRepository.findByTravelFeed_Id(feed.getId())
                .orElse(new ManagedTravelFeed());

        managed.setTravelFeed(feed);
        managed.setAdmin(admin);
        managed.setStatus(request.getStatus()); // 관리 기록은 원래 요청 상태로
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

    // ✅ 피드 관리 상태 해제 메서드 추가
    @Transactional
    public void restoreFeed(String adminEmail, Long feedId) {
        Admin admin = adminRepository.findByEmail(adminEmail)
                .orElseThrow(() -> new IllegalArgumentException("관리자 정보 없음"));

        TravelFeed feed = travelFeedRepository.findById(feedId)
                .orElseThrow(() -> new IllegalArgumentException("해당 피드 없음"));

        // ✅ 피드 상태를 ACTIVE로 복원
        feed.setStatus("ACTIVE");
        travelFeedRepository.save(feed);
        
        System.out.println("=== 피드 상태 해제 ===");
        System.out.println("피드 ID: " + feed.getId());
        System.out.println("복원된 상태: ACTIVE");

        // ✅ 관리 기록 삭제 (상태 해제이므로 기록 제거)
        managedTravelFeedRepository.findByTravelFeed_Id(feed.getId())
                .ifPresent(managedFeed -> {
                    System.out.println("관리 기록 삭제: " + managedFeed.getId());
                    managedTravelFeedRepository.delete(managedFeed);
                });

        // ✅ 관리자 액션 로그 기록
        adminActionLogRepository.save(AdminActionLog.builder()
                .admin(admin)
                .actionType("FEED_RESTORE")
                .targetEntityType("travel_feed")
                .targetEntityId(feed.getId())
                .actionDetails("피드 관리 상태 해제")
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

    public List<AdminUserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(AdminUserDto::new)
                .toList(); // DTO로 변환하여 Jackson serialization 문제 해결
    }

    public List<AdminFeedDto> getAllFeeds() {
        // ✅ ACTIVE 상태인 피드만 조회
        List<TravelFeed> activeFeeds = travelFeedRepository.findAllByStatusOrderByCreatedAtDesc("ACTIVE");
        System.out.println("=== 전체 피드 조회 ===");
        System.out.println("ACTIVE 상태 피드 수: " + activeFeeds.size());
        
        return activeFeeds.stream()
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

    public List<AdminManagedFeedDto> getManagedFeeds() {
        // ✅ 관리된 피드만 조회 (DEACTIVE 또는 DELETED 상태)
        List<ManagedTravelFeed> managedFeeds = managedTravelFeedRepository.findAll().stream()
                .filter(managed -> {
                    String feedStatus = managed.getTravelFeed().getStatus();
                    return "DEACTIVE".equals(feedStatus) || "DELETED".equals(feedStatus);
                })
                .toList();
        
        System.out.println("=== 관리된 피드 조회 ===");
        System.out.println("관리된 피드 수: " + managedFeeds.size());
        
        return managedFeeds.stream()
                .map(AdminManagedFeedDto::new)
                .toList();
    }

    public List<TravelPlanResponseDto> getAllTravelPlans() {
        List<TravelPlan> travelPlans = travelPlanRepository.findAll();
        System.out.println("=== 전체 여행 계획 조회 ===");
        System.out.println("여행 계획 수: " + travelPlans.size());
        return travelPlans.stream()
                .map(this::convertToResponseDto) // ✅ 수동 변환 메서드 사용
                .toList();
    }
    
    /**
     * 관리자가 특정 여행 계획 조회 (피드 모달용)
     */
    public Optional<TravelPlanResponseDto> getTravelPlanForAdmin(Long id) {
        System.out.println("=== 관리자 여행 계획 조회 ===");
        System.out.println("조회할 여행 계획 ID: " + id);
        
        Optional<TravelPlan> travelPlan = travelPlanRepository.findById(id);
        if (travelPlan.isPresent()) {
            System.out.println("✅ 여행 계획 조회 성공: " + travelPlan.get().getTitle());
            return Optional.of(convertToResponseDto(travelPlan.get())); // ✅ 수동 변환 메서드 사용
        } else {
            System.out.println("❌ 여행 계획을 찾을 수 없음: " + id);
            return Optional.empty();
        }
    }
    
    /**
     * TravelPlan 엔티티를 TravelPlanResponseDto로 변환
     */
    private TravelPlanResponseDto convertToResponseDto(TravelPlan plan) {
        return TravelPlanResponseDto.builder()
                .id(plan.getId())
                .title(plan.getTitle())
                .location(plan.getLocation())
                .startDate(plan.getStartDate())
                .endDate(plan.getEndDate())
                .description(plan.getDescription())
                .interests(plan.getInterests())
                .budget(plan.getBudget())
                .destination(plan.getDestination())
                .numberOfPeople(plan.getNumberOfPeople())
                .createdAt(plan.getCreatedAt())
                .planId(plan.getPlanId()) // ✅ TravelPlan의 planId 필드 사용
                .matchingEnabled(plan.getMatchingEnabled())
                .imageUrl(plan.getImageUrl())
                .aiHashtags(plan.getAiHashtags())
                .nearbyRecommendations(plan.getNearbyRecommendations())
                .schedules(plan.getSchedules())
                .participants(plan.getParticipants())
                .introduction(plan.getIntroduction())
                .authorId(plan.getUser() != null ? plan.getUser().getId() : null)
                .authorNickname(plan.getUser() != null ? plan.getUser().getNickname() : plan.getAuthorName()) // ✅ authorName 필드 추가
                .authorProfileImage(plan.getUser() != null && plan.getUser().getProfile() != null ? 
                    plan.getUser().getProfile().getProfileImage() : null) // ✅ User -> Profile -> profileImage 경로
                .build();
    }
}
