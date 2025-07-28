package com.main.TravelMate.match.controller;

import com.main.TravelMate.common.security.CustomUserDetails;
import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.match.dto.MatchRecommendationDto;
import com.main.TravelMate.match.dto.MatchRequestDto;
import com.main.TravelMate.match.dto.MatchResponseDto;
import com.main.TravelMate.match.dto.TravelStatusUpdateRequestDto;
import com.main.TravelMate.match.service.MatchingService;
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
    public ResponseEntity<List<MatchRecommendationDto>> getRecommendations(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getRecommendations(userId));
    }

    @PostMapping("/request")
    public ResponseEntity<MatchResponseDto> sendRequest(
            @RequestBody MatchRequestDto request,
            Authentication auth) {
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        Long matchId = matchingService.sendRequest(senderId, request);
        return ResponseEntity.ok(new MatchResponseDto(matchId, MatchingStatus.PENDING));
    }

    @PatchMapping("/respond")
    public ResponseEntity<String> respondToRequest(
            @RequestBody MatchResponseDto requestDto
    ) {
        matchingService.respondToRequest(requestDto.getMatchId(), requestDto.getStatus());
        return ResponseEntity.ok("매칭 요청에 응답했습니다: " + requestDto.getStatus());
    }

    @DeleteMapping("/cancel/{matchId}")
    public ResponseEntity<String> cancelRequest(
            @PathVariable Long matchId,
            Authentication auth
    ) {
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        matchingService.cancelRequest(matchId, senderId);
        return ResponseEntity.ok("매칭 요청이 취소되었습니다.");
    }

    @PostMapping("/reject") // 매칭 리스트에서 X 버튼 누를시
    public ResponseEntity<Void> rejectPlan(
            @RequestBody MatchRequestDto request,
            Authentication auth
    ) {
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        matchingService.rejectPlan(senderId, request.getPlanId());
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/cancel/accepted/{matchId}")
    public ResponseEntity<String> cancelAcceptedMatch(
            @PathVariable Long matchId,
            Authentication auth
    ) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        matchingService.cancelAcceptedMatch(matchId, userId);
        return ResponseEntity.ok("수락된 매칭이 취소되었습니다.");
    }

    @PatchMapping("/travel-status")
    public ResponseEntity<String> updateTravelStatus(
            @RequestBody TravelStatusUpdateRequestDto request,
            Authentication auth
    ) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        matchingService.updateTravelStatus(userId, request.getTravelPlanId(), request.getStatus());
        return ResponseEntity.ok("여행 상태가 변경되었습니다: " + request.getStatus());
    }



    @GetMapping("/my/sent") // 내가 보낸 모든 매칭 요청 조회
    public ResponseEntity<List<MatchResponseDto>> getSentRequests(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getMySentRequests(userId));
    }

    @GetMapping("/my/received") // 내가 받은 PENDING 요청만 조회
    public ResponseEntity<List<MatchResponseDto>> getReceivedRequests(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getMyReceivedRequests(userId));
    }

    @GetMapping("/my/accepted") // 내가 포함된 ACCEPTED 매칭 조회
    public ResponseEntity<List<MatchResponseDto>> getAcceptedMatches(Authentication auth) {
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        return ResponseEntity.ok(matchingService.getMyAcceptedMatches(userId));
    }
}
