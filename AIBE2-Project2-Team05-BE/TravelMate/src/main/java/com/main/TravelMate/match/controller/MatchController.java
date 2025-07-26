package com.main.TravelMate.match.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.match.dto.*;
import com.main.TravelMate.match.service.MatchingService;
import com.main.TravelMate.user.domain.Role;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 여행 파트너 매칭 REST API 컨트롤러
 * 매칭 검색, 요청 관리, 통계 조회 등의 엔드포인트 제공
 */
@RestController
@RequestMapping("/api/matches")
@RequiredArgsConstructor
public class MatchController {

    private final MatchingService matchingService;

    /**
     * 호환 가능한 여행 파트너 검색
     * GET /api/matches/search
     * Requirements: 1.1 - 목적지와 여행 날짜를 입력하여 검색
     */
    @GetMapping("/search")
    public ResponseEntity<List<UserMatchDto>> searchCompatibleTravelers(
            @Valid @ModelAttribute MatchSearchCriteria criteria,
            Authentication authentication) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long currentUserId = userDetails.getUser().getId();
        
        List<UserMatchDto> compatibleTravelers = matchingService.searchCompatibleTravelers(criteria, currentUserId);
        return ResponseEntity.ok(compatibleTravelers);
    }

    /**
     * 매칭 요청 전송
     * POST /api/matches/request
     * Requirements: 2.1 - 다른 여행자에게 매칭 요청 보내기
     */
    @PostMapping("/request")
    public ResponseEntity<MatchRequestDto> sendMatchRequest(
            @Valid @RequestBody SendMatchRequestDto requestDto,
            Authentication authentication) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long requesterId = userDetails.getUser().getId();
        
        MatchRequestDto matchRequest = matchingService.sendMatchRequest(
            requesterId, 
            requestDto.getReceiverId(), 
            requestDto.getTravelPlanId(), 
            requestDto.getMessage()
        );
        
        return ResponseEntity.ok(matchRequest);
    }

    /**
     * 매칭 요청에 응답 (수락/거절)
     * PUT /api/matches/request/{id}
     * Requirements: 3.2, 3.3 - 매칭 요청 수락/거절
     */
    @PutMapping("/request/{id}")
    public ResponseEntity<MatchRequestDto> respondToMatchRequest(
            @PathVariable Long id,
            @Valid @RequestBody MatchResponseRequestDto responseDto,
            Authentication authentication) {
        
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();
        
        MatchRequestDto updatedRequest = matchingService.respondToMatchRequest(
            id, 
            userId, 
            responseDto.isAccept()
        );
        
        return ResponseEntity.ok(updatedRequest);
    }

    /**
     * 받은 매칭 요청 목록 조회
     * GET /api/matches/received
     * Requirements: 3.1 - 받은 매칭 요청 목록 조회
     */
    @GetMapping("/received")
    public ResponseEntity<List<MatchRequestDto>> getReceivedRequests(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();
        
        List<MatchRequestDto> receivedRequests = matchingService.getReceivedRequests(userId);
        return ResponseEntity.ok(receivedRequests);
    }

    /**
     * 보낸 매칭 요청 목록 조회
     * GET /api/matches/sent
     * Requirements: 4.1 - 보낸 요청과 받은 요청 조회
     */
    @GetMapping("/sent")
    public ResponseEntity<List<MatchRequestDto>> getSentRequests(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();
        
        List<MatchRequestDto> sentRequests = matchingService.getSentRequests(userId);
        return ResponseEntity.ok(sentRequests);
    }

    /**
     * 활성 매칭 목록 조회 (수락된 매칭)
     * GET /api/matches/active
     * Requirements: 4.3 - 현재 활성화된 매칭 관계 조회
     */
    @GetMapping("/active")
    public ResponseEntity<List<UserMatchDto>> getActiveMatches(Authentication authentication) {
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        Long userId = userDetails.getUser().getId();
        
        List<UserMatchDto> activeMatches = matchingService.getActiveMatches(userId);
        return ResponseEntity.ok(activeMatches);
    }

    /**
     * 매칭 시스템 통계 조회 (관리자 전용)
     * GET /api/matches/statistics
     * Requirements: 6.1, 6.2 - 매칭 통계 조회 및 성공률 계산
     */
    @GetMapping("/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MatchStatisticsDto> getMatchingStatistics() {
        MatchStatisticsDto statistics = matchingService.getMatchingStatistics();
        return ResponseEntity.ok(statistics);
    }
}