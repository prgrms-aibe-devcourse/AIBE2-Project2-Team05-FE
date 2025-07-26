package com.main.TravelMate.plan.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.plan.dto.TravelPlanCreateRequestDto;
import com.main.TravelMate.plan.dto.TravelPlanResponseDto;
import com.main.TravelMate.plan.service.TravelPlanService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/plan")
@RequiredArgsConstructor
public class TravelPlanController {
    private static final Logger logger = LoggerFactory.getLogger(TravelPlanController.class);
    private final TravelPlanService planService;

    @PostMapping
    public ResponseEntity<String> createPlan(@RequestBody TravelPlanCreateRequestDto request) {
        logger.info("🚀 여행 계획 생성 요청 시작");
        
        // SecurityContext 디버깅
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            logger.info("🔐 인증 정보:");
            logger.info("  - Principal 타입: {}", auth.getPrincipal().getClass().getName());
            logger.info("  - Principal: {}", auth.getPrincipal());
            logger.info("  - 권한: {}", auth.getAuthorities());
            logger.info("  - 인증 여부: {}", auth.isAuthenticated());
            
            if (auth.getPrincipal() instanceof CustomUserDetails) {
                CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
                logger.info("  - 사용자 이메일: {}", userDetails.getUsername());
                logger.info("  - 사용자 권한: {}", userDetails.getAuthorities());
                logger.info("  - 사용자 Role: {}", userDetails.getUser().getRole());
            }
        } else {
            logger.warn("❌ SecurityContext에 인증 정보가 없습니다!");
            return ResponseEntity.status(401).body("인증 정보가 없습니다");
        }
        
        try {
            CustomUserDetails userDetails = (CustomUserDetails) auth.getPrincipal();
            planService.createPlan(userDetails.getUsername(), request);
            logger.info("✅ 여행 계획 생성 성공");
            return ResponseEntity.ok("여행 계획이 성공적으로 생성되었습니다");
        } catch (Exception e) {
            logger.error("❌ 여행 계획 생성 실패", e);
            return ResponseEntity.status(500).body("여행 계획 생성 실패: " + e.getMessage());
        }
    }

    @GetMapping
    public ResponseEntity<List<TravelPlanResponseDto>> getPlans(Authentication authentication) {
        CustomUserDetails user = (CustomUserDetails) authentication.getPrincipal();
        return ResponseEntity.ok(planService.getUserPlans(user.getUsername()));
    }
    
    /**
     * 매칭 활성화된 여행 계획 목록 조회 (legacy 기능)
     * GET /api/plan/matching
     */
    @GetMapping("/matching")
    public ResponseEntity<List<TravelPlanResponseDto>> getMatchingTravelPlans() {
        return ResponseEntity.ok(planService.getMatchingEnabledTravelPlans());
    }
    
    /**
     * planId로 여행 계획 조회 (legacy 호환)
     * GET /api/plan/by-plan-id/{planId}
     */
    @GetMapping("/by-plan-id/{planId}")
    public ResponseEntity<TravelPlanResponseDto> getTravelPlanByPlanId(@PathVariable String planId) {
        return planService.getTravelPlanByPlanId(planId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * ID로 여행 계획 조회
     * GET /api/plan/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<TravelPlanResponseDto> getTravelPlan(@PathVariable Long id) {
        return planService.getTravelPlanById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
    
    /**
     * 여행 계획 삭제 (legacy 기능)
     * DELETE /api/plan/{id}
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTravelPlan(@PathVariable Long id,
                                                @AuthenticationPrincipal CustomUserDetails user) {
        planService.deleteTravelPlan(id, user.getUser().getEmail());
        return ResponseEntity.noContent().build();
    }
    
    // ✅ Google Places API를 사용한 이미지 업데이트 엔드포인트들 추가
    
    /**
     * 모든 여행 계획의 이미지 URL을 Google Places API로 업데이트
     * POST /api/plan/update-all-images
     */
    @PostMapping("/update-all-images")
    public ResponseEntity<String> updateAllPlanImages() {
        logger.info("🔄 모든 여행 계획 이미지 업데이트 요청");
        try {
            planService.updateAllPlanImages();
            return ResponseEntity.ok("모든 여행 계획의 이미지 URL이 Google Places API로 업데이트되었습니다");
        } catch (Exception e) {
            logger.error("❌ 모든 여행 계획 이미지 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("이미지 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 특정 여행 계획의 이미지 URL을 Google Places API로 업데이트
     * POST /api/plan/{id}/update-image
     */
    @PostMapping("/{id}/update-image")
    public ResponseEntity<String> updatePlanImage(@PathVariable Long id) {
        logger.info("🔄 여행 계획 ID {} 이미지 업데이트 요청", id);
        try {
            planService.updatePlanImage(id);
            return ResponseEntity.ok("여행 계획 ID " + id + "의 이미지 URL이 Google Places API로 업데이트되었습니다");
        } catch (Exception e) {
            logger.error("❌ 여행 계획 ID {} 이미지 업데이트 실패: {}", id, e.getMessage());
            return ResponseEntity.badRequest().body("이미지 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 이미지 URL이 없는 여행 계획들만 Google Places API로 업데이트
     * POST /api/plan/update-missing-images
     */
    @PostMapping("/update-missing-images")
    public ResponseEntity<String> updatePlansWithoutImages() {
        logger.info("🔄 이미지 없는 여행 계획들 이미지 업데이트 요청");
        try {
            planService.updatePlansWithoutImages();
            return ResponseEntity.ok("이미지 URL이 없는 여행 계획들이 Google Places API로 업데이트되었습니다");
        } catch (Exception e) {
            logger.error("❌ 이미지 없는 여행 계획 이미지 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("이미지 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * author_name이 없는 여행 계획들을 사용자 닉네임으로 업데이트
     * POST /api/plan/update-missing-author-names
     */
    @PostMapping("/update-missing-author-names")
    public ResponseEntity<String> updateMissingAuthorNames() {
        logger.info("🔄 author_name이 없는 여행 계획들 업데이트 요청");
        try {
            planService.updateMissingAuthorNames();
            return ResponseEntity.ok("author_name이 없는 여행 계획들이 사용자 닉네임으로 업데이트되었습니다");
        } catch (Exception e) {
            logger.error("❌ author_name 업데이트 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("author_name 업데이트 실패: " + e.getMessage());
        }
    }
    
    /**
     * 디버깅용: 모든 여행 계획의 author_name 확인
     * GET /api/plan/debug-author-names
     */
    @GetMapping("/debug-author-names")
    public ResponseEntity<String> debugAuthorNames() {
        logger.info("🔍 author_name 디버깅 요청");
        try {
            String debugInfo = planService.getAuthorNamesDebugInfo();
            return ResponseEntity.ok(debugInfo);
        } catch (Exception e) {
            logger.error("❌ author_name 디버깅 실패: {}", e.getMessage());
            return ResponseEntity.badRequest().body("디버깅 실패: " + e.getMessage());
        }
    }
}
