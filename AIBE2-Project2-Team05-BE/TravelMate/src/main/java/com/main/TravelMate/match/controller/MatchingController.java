package com.main.TravelMate.match.controller;

import com.main.TravelMate.match.dto.*;
import com.main.TravelMate.match.service.MatchingService;
import com.main.TravelMate.common.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<UserMatchDto>> getRecommendations(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        // 기본 검색 조건으로 호환 가능한 여행자 검색
        MatchSearchCriteria criteria = new MatchSearchCriteria();
        return ResponseEntity.ok(matchingService.searchCompatibleTravelers(criteria, userId));
    }

    @PostMapping("/request")
    public ResponseEntity<MatchRequestDto> sendRequest(
            @RequestBody MatchRequestDto request,
            Authentication auth) {
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        // MatchRequestDto에서 필요한 정보 추출
        MatchRequestDto result = matchingService.sendMatchRequest(
            senderId, 
            request.getReceiverId(), 
            request.getTravelPlanId(), 
            request.getMessage()
        );
        return ResponseEntity.ok(result);
    }

    @PatchMapping("/respond")
    public ResponseEntity<MatchRequestDto> respondToRequest(
            @RequestBody MatchResponseRequestDto requestDto
    ) {
        MatchRequestDto result = matchingService.respondToMatchRequest(
            requestDto.getMatchId(), 
            requestDto.getUserId(), 
            requestDto.isAccept()
        );
        return ResponseEntity.ok(result);
    }

    @GetMapping("/received")
    public ResponseEntity<List<MatchRequestDto>> getReceivedRequests(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getReceivedRequests(userId));
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MatchRequestDto>> getSentRequests(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getSentRequests(userId));
    }

    @GetMapping("/active")
    public ResponseEntity<List<UserMatchDto>> getActiveMatches(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getActiveMatches(userId));
    }

    @GetMapping("/statistics")
    public ResponseEntity<MatchStatisticsDto> getStatistics() {
        return ResponseEntity.ok(matchingService.getMatchingStatistics());
    }
}
