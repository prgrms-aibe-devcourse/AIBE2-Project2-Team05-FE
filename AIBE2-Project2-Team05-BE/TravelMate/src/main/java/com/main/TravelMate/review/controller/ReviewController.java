package com.main.TravelMate.review.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.review.dto.ReviewCreateRequestDto;
import com.main.TravelMate.review.dto.ReviewResponseDto;
import com.main.TravelMate.review.service.ReviewService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/review")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = {"http://localhost:3000", "http://127.0.0.1:3000"})
public class ReviewController {

    private final ReviewService reviewService;

    /**
     * 특정 피드에 후기 작성
     * POST /api/review/feed/{feedId}
     */
    @PostMapping("/feed/{feedId}")
    public ResponseEntity<?> createReview(
            @PathVariable Long feedId,
            @Valid @RequestBody ReviewCreateRequestDto requestDto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        try {
            log.info("🌟 후기 작성 요청 - 피드 ID: {}, 사용자: {}", feedId, userDetails.getUsername());
            
            ReviewResponseDto review = reviewService.createReview(
                    feedId, 
                    userDetails.getUsername(), 
                    requestDto
            );
            
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "message", "후기가 성공적으로 작성되었습니다",
                            "review", review,
                            "timestamp", LocalDateTime.now()
                    ));
                    
        } catch (SecurityException e) {
            log.warn("🚫 후기 작성 권한 없음 - 피드 ID: {}, 사용자: {}, 오류: {}", 
                    feedId, userDetails.getUsername(), e.getMessage());
            return ResponseEntity.status(403)
                    .body(Map.of(
                            "success", false,
                            "message", e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
                    
        } catch (Exception e) {
            log.error("❌ 후기 작성 실패 - 피드 ID: {}, 사용자: {}, 오류: {}", 
                    feedId, userDetails.getUsername(), e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "후기 작성 실패: " + e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * 특정 피드의 모든 후기 조회
     * GET /api/review/feed/{feedId}
     */
    @GetMapping("/feed/{feedId}")
    public ResponseEntity<?> getReviewsByFeedId(@PathVariable Long feedId) {
        try {
            log.info("📋 피드 후기 조회 요청 - 피드 ID: {}", feedId);
            
            List<ReviewResponseDto> reviews = reviewService.getReviewsByFeedId(feedId);
            ReviewService.ReviewStatsDto stats = reviewService.getReviewStats(feedId);
            
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "reviews", reviews,
                            "stats", Map.of(
                                    "averageRating", stats.getAverageRating(),
                                    "reviewCount", stats.getReviewCount()
                            ),
                            "timestamp", LocalDateTime.now()
                    ));
                    
        } catch (Exception e) {
            log.error("❌ 피드 후기 조회 실패 - 피드 ID: {}, 오류: {}", feedId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "후기 조회 실패: " + e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }

    /**
     * 특정 피드의 후기 통계만 조회
     * GET /api/review/feed/{feedId}/stats
     */
    @GetMapping("/feed/{feedId}/stats")
    public ResponseEntity<?> getReviewStats(@PathVariable Long feedId) {
        try {
            log.info("📊 피드 후기 통계 조회 - 피드 ID: {}", feedId);
            
            ReviewService.ReviewStatsDto stats = reviewService.getReviewStats(feedId);
            
            return ResponseEntity.ok()
                    .body(Map.of(
                            "success", true,
                            "stats", stats,
                            "timestamp", LocalDateTime.now()
                    ));
                    
        } catch (Exception e) {
            log.error("❌ 피드 후기 통계 조회 실패 - 피드 ID: {}, 오류: {}", feedId, e.getMessage(), e);
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "success", false,
                            "message", "후기 통계 조회 실패: " + e.getMessage(),
                            "timestamp", LocalDateTime.now()
                    ));
        }
    }
} 