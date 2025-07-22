package com.main.TravelMate.travelplan.controller;

import com.main.TravelMate.travelplan.service.TravelPlanService;
import com.main.TravelMate.travelplan.dto.TravelPlanRequest;
import com.main.TravelMate.travelplan.dto.TravelPlanResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * 여행 계획 컨트롤러
 * 여행 계획 관련 REST API 엔드포인트
 */
@Slf4j
@RestController
@RequestMapping("/api/travel-plans")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000") // React 개발 서버
public class TravelPlanController {
    
    private final TravelPlanService travelPlanService;
    
    /**
     * 여행 계획 저장 (생성 또는 업데이트)
     * POST /api/travel-plans
     */
    @PostMapping
    public ResponseEntity<TravelPlanResponse> saveTravelPlan(@RequestBody TravelPlanRequest request) {
        try {
            log.info("여행 계획 저장 요청: planId={}, title={}", request.getPlanId(), request.getTitle());
            
            TravelPlanResponse response = travelPlanService.saveTravelPlan(request);
            
            log.info("여행 계획 저장 완료: planId={}", response.getPlanId());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            log.error("여행 계획 저장 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 여행 계획 조회
     * GET /api/travel-plans/{planId}
     */
    @GetMapping("/{planId}")
    public ResponseEntity<TravelPlanResponse> getTravelPlan(@PathVariable String planId) {
        try {
            log.info("여행 계획 조회 요청: planId={}", planId);
            
            Optional<TravelPlanResponse> travelPlan = travelPlanService.getTravelPlan(planId);
            
            if (travelPlan.isPresent()) {
                log.info("여행 계획 조회 성공: planId={}", planId);
                return ResponseEntity.ok(travelPlan.get());
            } else {
                log.warn("여행 계획을 찾을 수 없음: planId={}", planId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("여행 계획 조회 중 오류 발생: planId={}", planId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 사용자의 여행 계획 목록 조회
     * GET /api/travel-plans?userId={userId}
     */
    @GetMapping
    public ResponseEntity<List<TravelPlanResponse>> getUserTravelPlans(@RequestParam String userId) {
        try {
            log.info("사용자 여행 계획 목록 조회: userId={}", userId);
            
            List<TravelPlanResponse> travelPlans = travelPlanService.getUserTravelPlans(userId);
            
            log.info("사용자 여행 계획 목록 조회 완료: userId={}, count={}", userId, travelPlans.size());
            return ResponseEntity.ok(travelPlans);
            
        } catch (Exception e) {
            log.error("사용자 여행 계획 목록 조회 중 오류 발생: userId={}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 매칭 활성화된 여행 계획 목록 조회 (여행메이트 찾기)
     * GET /api/travel-plans/matching
     */
    @GetMapping("/matching")
    public ResponseEntity<List<TravelPlanResponse>> getMatchingTravelPlans() {
        try {
            log.info("매칭 여행 계획 목록 조회 요청");
            
            List<TravelPlanResponse> travelPlans = travelPlanService.getMatchingEnabledTravelPlans();
            
            log.info("매칭 여행 계획 목록 조회 완료: count={}", travelPlans.size());
            return ResponseEntity.ok(travelPlans);
            
        } catch (Exception e) {
            log.error("매칭 여행 계획 목록 조회 중 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * 여행 계획 삭제
     * DELETE /api/travel-plans/{planId}?userId={userId}
     */
    @DeleteMapping("/{planId}")
    public ResponseEntity<Void> deleteTravelPlan(@PathVariable String planId, @RequestParam String userId) {
        try {
            log.info("여행 계획 삭제 요청: planId={}, userId={}", planId, userId);
            
            boolean deleted = travelPlanService.deleteTravelPlan(planId, userId);
            
            if (deleted) {
                log.info("여행 계획 삭제 완료: planId={}", planId);
                return ResponseEntity.noContent().build();
            } else {
                log.warn("삭제할 여행 계획을 찾을 수 없거나 권한이 없음: planId={}, userId={}", planId, userId);
                return ResponseEntity.notFound().build();
            }
            
        } catch (Exception e) {
            log.error("여행 계획 삭제 중 오류 발생: planId={}, userId={}", planId, userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    /**
     * API 상태 확인 (헬스체크)
     * GET /api/travel-plans/health
     */
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Travel Plan API is running");
    }
} 