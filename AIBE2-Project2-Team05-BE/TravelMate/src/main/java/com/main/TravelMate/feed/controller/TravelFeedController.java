package com.main.TravelMate.feed.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.feed.dto.FeedCreateRequestDto;

import com.main.TravelMate.feed.domain.TravelStatus;
import com.main.TravelMate.feed.dto.TravelFeedResponseDto;
import com.main.TravelMate.feed.dto.TravelStatusUpdateRequest;
import com.main.TravelMate.feed.entity.TravelFeed;
import com.main.TravelMate.feed.repository.TravelFeedRepository;
import com.main.TravelMate.feed.service.TravelFeedService;
import com.main.TravelMate.feed.service.TravelFeedMigrationService;
import com.main.TravelMate.feed.service.FeedLikeService;
import com.main.TravelMate.feed.dto.LikeToggleRequestDto;
import com.main.TravelMate.feed.dto.LikeResponseDto;
import com.main.TravelMate.feed.dto.LikeStatusResponseDto;
import com.main.TravelMate.feed.dto.LikeUsersResponseDto;
import com.main.TravelMate.plan.dto.TravelDayDto;
import com.main.TravelMate.plan.dto.TravelScheduleDto;
import com.main.TravelMate.plan.entity.TravelPlan;
import com.main.TravelMate.user.entity.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.main.TravelMate.common.security.CustomUserDetails;

import java.time.LocalDateTime;
import java.util.Map;

import java.util.List;
import com.main.TravelMate.feed.dto.CursorFeedResponseDto;

@RestController
@RequestMapping("/api/feed")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"}) // CORS 명시적 허용
public class TravelFeedController {

    private final TravelFeedRepository feedRepository;
    private final TravelFeedService feedService; // ✅ 서비스 추가
    private final FeedLikeService feedLikeService; // ✅ 좋아요 서비스 추가

    // ✅ 기존 페이지 기반 피드 목록 조회
    @GetMapping
    public ResponseEntity<List<TravelFeedResponseDto>> getAllFeeds(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<TravelFeedResponseDto> feeds = feedService.getAllFeeds(page, size);
        return ResponseEntity.ok(feeds);
    }

    // ✅ 새로운 커서 기반 피드 목록 조회 (대용량 최적화)
    @GetMapping("/cursor")
    public ResponseEntity<CursorFeedResponseDto> getFeedsWithCursor(
            @RequestParam(required = false) Long cursor,
            @RequestParam(defaultValue = "15") int size
    ) {
        CursorFeedResponseDto response = feedService.getFeedsWithCursor(cursor, size);
        return ResponseEntity.ok(response);
    }

    // ✅ 모든 피드 상태를 ACTIVE로 업데이트하는 엔드포인트 추가
    @PostMapping("/update-status-active")
    public ResponseEntity<String> updateAllFeedsToActive() {
        try {
            feedService.updateAllFeedsToActive();
            return ResponseEntity.ok("모든 피드 상태가 ACTIVE로 업데이트되었습니다");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("피드 상태 업데이트 실패: " + e.getMessage());
        }
    }

    // ✅ via.placeholder.com URL을 로컬 기본 이미지로 변경하는 엔드포인트 추가
    @PostMapping("/fix-placeholder-images")
    public ResponseEntity<String> fixPlaceholderImages() {
        try {
            feedService.fixPlaceholderImages();
            return ResponseEntity.ok("모든 placeholder 이미지가 안정적인 로컬 이미지로 변경되었습니다");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("이미지 URL 수정 실패: " + e.getMessage());
        }
    }

    // ✅ 피드 이미지 업데이트 엔드포인트 추가
    @PostMapping("/update-images")
    public ResponseEntity<String> updateFeedImages() {
        feedService.updateFeedImages();
        return ResponseEntity.ok("피드 이미지 업데이트 완료");
    }
    
    // ✅ 모든 피드의 이미지 URL을 travel_plan에서 업데이트하는 엔드포인트 추가
    @PostMapping("/update-all-images")
    public ResponseEntity<String> updateAllFeedImages() {
        try {
            feedService.updateAllFeedImages();
            return ResponseEntity.ok("모든 피드 이미지 URL 업데이트 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("모든 피드 이미지 URL 업데이트 실패: " + e.getMessage());
        }
    }
    
    // ✅ 모든 travel_plan 정보를 기반으로 피드 전체 업데이트 엔드포인트 추가
    @PostMapping("/update-all-feeds")
    public ResponseEntity<String> updateAllFeedsFromPlans() {
        try {
            feedService.updateAllFeedsFromPlans();
            return ResponseEntity.ok("모든 피드가 여행 계획 정보로 업데이트 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("모든 피드 업데이트 실패: " + e.getMessage());
        }
    }
    
    // ✅ 특정 여행 계획에 대한 피드 수동 생성 엔드포인트 추가
    @PostMapping("/create-from-plan/{planId}")
    public ResponseEntity<String> createFeedFromPlan(@PathVariable Long planId) {
        try {
            feedService.createFeedFromExistingPlan(planId);
            return ResponseEntity.ok("피드 생성 완료");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("피드 생성 실패: " + e.getMessage());
        }
    }

    // ✅ TravelPlan ID로 피드 조회 API
    @GetMapping("/plan/{travelPlanId}")
    public ResponseEntity<TravelFeedResponseDto> getFeedByPlanId(@PathVariable Long travelPlanId) {
        try {
            TravelFeedResponseDto feedResponse = feedService.getFeedByTravelPlanId(travelPlanId);
            return ResponseEntity.ok(feedResponse);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    // 🎯 여행 상태 변경 (TravelPlan ID 사용)
    @PutMapping("/plan/{travelPlanId}/travel-status")
    public ResponseEntity<?> updateTravelStatusByPlanId(
            @PathVariable Long travelPlanId,
            @RequestBody TravelStatusUpdateRequest request) {
        
        try {
            // 1. 인증 확인
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated() || !(auth.getPrincipal() instanceof CustomUserDetails)) {
                log.warn("🚫 TravelPlan ID {} 상태 변경 실패: 인증되지 않은 사용자", travelPlanId);
                return ResponseEntity.status(401)
                    .body(Map.of(
                        "success", false,
                        "message", "로그인이 필요합니다",
                        "travelPlanId", travelPlanId,
                        "timestamp", LocalDateTime.now()
                    ));
            }

            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            Long currentUserId = userDetails.getUser().getId();
            
            log.info("🔄 TravelPlan ID {} 여행 상태 변경 요청: {} (사용자 ID: {})", 
                    travelPlanId, request.getTravelStatus(), currentUserId);
            
            // 2. 작성자 권한 체크 및 상태 변경 (TravelPlan ID 사용)
            TravelFeed updatedFeed = feedService.updateTravelStatusByPlanIdWithAuth(
                travelPlanId, 
                currentUserId,
                request.getTravelStatus(), 
                request.getNote()
            );
            
            log.info("✅ TravelPlan ID {} 여행 상태 변경 성공: {}", travelPlanId, updatedFeed.getTravelStatus());
            return ResponseEntity.ok()
                .body(Map.of(
                    "success", true,
                    "message", "여행 상태가 성공적으로 변경되었습니다",
                    "travelPlanId", travelPlanId,
                    "newStatus", updatedFeed.getTravelStatus(),
                    "timestamp", LocalDateTime.now()
                ));

        } catch (SecurityException e) {
            log.warn("🚫 TravelPlan ID {} 상태 변경 권한 없음: {}", travelPlanId, e.getMessage());
            
            return ResponseEntity.status(403)
                .body(Map.of(
                    "success", false,
                    "message", e.getMessage(),
                    "travelPlanId", travelPlanId,
                    "timestamp", LocalDateTime.now()
                ));
                
        } catch (Exception e) {
            log.error("❌ TravelPlan ID {} 여행 상태 변경 실패: {}", travelPlanId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "여행 상태 변경 실패: " + e.getMessage(),
                    "travelPlanId", travelPlanId,
                    "timestamp", LocalDateTime.now()
                ));
        }
    }

    // ✅ 데이터 마이그레이션 API 추가
    @Autowired
    private TravelFeedMigrationService migrationService;
    
    /**
     * TravelFeed ID 마이그레이션 실행
     * POST /api/feed/migrate-ids
     */
    @PostMapping("/migrate-ids")
    public ResponseEntity<?> migrateTravelFeedIds() {
        try {
            log.info("🔄 TravelFeed ID 마이그레이션 API 호출");
            
            migrationService.migrateTravelFeedIds();
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "success", true,
                    "message", "TravelFeed ID 마이그레이션이 성공적으로 완료되었습니다",
                    "timestamp", LocalDateTime.now()
                ));
                
        } catch (Exception e) {
            log.error("❌ TravelFeed ID 마이그레이션 실패: {}", e.getMessage(), e);
            
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "마이그레이션 실패: " + e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
        }
    }
    
    /**
     * 마이그레이션 상태 확인
     * GET /api/feed/migration-status
     */
    @GetMapping("/migration-status")
    public ResponseEntity<?> checkMigrationStatus() {
        try {
            log.info("🔍 TravelFeed 마이그레이션 상태 확인 API 호출");
            
            migrationService.checkMigrationStatus();
            
            return ResponseEntity.ok()
                .body(Map.of(
                    "success", true,
                    "message", "마이그레이션 상태 확인 완료 (로그 참조)",
                    "timestamp", LocalDateTime.now()
                ));
                
        } catch (Exception e) {
            log.error("❌ 마이그레이션 상태 확인 실패: {}", e.getMessage(), e);
            
            return ResponseEntity.badRequest()
                .body(Map.of(
                    "success", false,
                    "message", "상태 확인 실패: " + e.getMessage(),
                    "timestamp", LocalDateTime.now()
                ));
        }
    }

    // ====== 좋아요 관련 API ======

    /**
     * 좋아요 토글 (추가/제거)
     */
    @PostMapping("/like/toggle")
    public ResponseEntity<LikeResponseDto> toggleLike(
            @RequestBody LikeToggleRequestDto request,
            Authentication authentication) {
        
        try {
            log.info("🔄 [좋아요 토글] 요청 - travelFeedId: {}, user: {}", 
                    request.getTravelFeedId(), authentication.getName());
            
            LikeResponseDto response = feedLikeService.toggleLike(
                    request.getTravelFeedId(), 
                    authentication.getName()
            );
            
            log.info("✅ [좋아요 토글] 완료 - liked: {}, count: {}", 
                    response.isLiked(), response.getLikeCount());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [좋아요 토글] 실패 - error: {}", e.getMessage(), e);
            
            LikeResponseDto errorResponse = LikeResponseDto.error("좋아요 처리 중 오류가 발생했습니다");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 좋아요 상태 조회
     */
    @GetMapping("/like/status")
    public ResponseEntity<LikeStatusResponseDto> getLikeStatus(
            @RequestParam Long travelFeedId,
            Authentication authentication) {
        
        try {
            log.info("🔍 [좋아요 상태] 조회 - travelFeedId: {}, user: {}", 
                    travelFeedId, authentication.getName());
            
            LikeStatusResponseDto response = feedLikeService.getLikeStatus(
                    travelFeedId, 
                    authentication.getName()
            );
            
            log.info("✅ [좋아요 상태] 조회 완료 - liked: {}, count: {}", 
                    response.isLiked(), response.getLikeCount());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [좋아요 상태] 조회 실패 - error: {}", e.getMessage(), e);
            
            LikeStatusResponseDto errorResponse = LikeStatusResponseDto.error();
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

    /**
     * 좋아요 개수만 조회 (인증 불필요)
     */
    @GetMapping("/like/count")
    public ResponseEntity<Map<String, Object>> getLikeCount(@RequestParam Long travelFeedId) {
        
        try {
            log.info("📊 [좋아요 개수] 조회 - travelFeedId: {}", travelFeedId);
            
            long likeCount = feedLikeService.getLikeCount(travelFeedId);
            
            log.info("✅ [좋아요 개수] 조회 완료 - count: {}", likeCount);
            
            return ResponseEntity.ok(Map.of(
                "success", true,
                "likeCount", likeCount
            ));
            
        } catch (Exception e) {
            log.error("❌ [좋아요 개수] 조회 실패 - error: {}", e.getMessage(), e);
            
            return ResponseEntity.badRequest().body(Map.of(
                "success", false,
                "likeCount", 0,
                "message", "좋아요 개수 조회 중 오류가 발생했습니다"
            ));
        }
    }

    /**
     * 좋아요한 사용자 목록 조회 (인증 불필요)
     */
    @GetMapping("/like/users")
    public ResponseEntity<LikeUsersResponseDto> getLikeUsers(@RequestParam Long travelFeedId) {
        
        try {
            log.info("👥 [좋아요 사용자] 조회 - travelFeedId: {}", travelFeedId);
            
            LikeUsersResponseDto response = feedLikeService.getLikeUsers(travelFeedId);
            
            log.info("✅ [좋아요 사용자] 조회 완료 - count: {}", response.getTotalCount());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("❌ [좋아요 사용자] 조회 실패 - error: {}", e.getMessage(), e);
            
            LikeUsersResponseDto errorResponse = LikeUsersResponseDto.error("좋아요한 사용자 목록 조회 중 오류가 발생했습니다");
            return ResponseEntity.badRequest().body(errorResponse);
        }
    }

}
