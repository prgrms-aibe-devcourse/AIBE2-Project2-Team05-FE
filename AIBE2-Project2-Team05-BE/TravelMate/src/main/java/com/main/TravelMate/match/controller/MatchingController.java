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
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")  // 🧪 테스트용: CORS 직접 설정
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    @GetMapping("/recommendations")
    public ResponseEntity<List<MatchRecommendationDto>> getRecommendations(Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("🔍 매칭 추천 조회 - 사용자 ID: " + userId);
        return ResponseEntity.ok(matchingService.getRecommendations(userId));
    }

    @PostMapping("/request")
    public ResponseEntity<MatchResponseDto> sendRequest(
            @RequestBody MatchRequestDto request,
            Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("💖 매칭 요청 전송 - 발신자 ID: " + senderId + ", 계획 ID: " + request.getPlanId());
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
        // 🔧 실제 인증된 사용자 ID 사용
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("🗑️ 매칭 요청 취소 - 사용자 ID: " + senderId + ", 매칭 ID: " + matchId);
        matchingService.cancelRequest(matchId, senderId);
        return ResponseEntity.ok("매칭 요청이 취소되었습니다.");
    }

    @PostMapping("/reject") // 매칭 리스트에서 X 버튼 누를시
    public ResponseEntity<Void> rejectPlan(
            @RequestBody MatchRequestDto request,
            Authentication auth
    ) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long senderId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("❌ 매칭 거절 - 사용자 ID: " + senderId + ", 계획 ID: " + request.getPlanId());
        matchingService.rejectPlan(senderId, request.getPlanId());
        return ResponseEntity.ok().build();
    }


    @DeleteMapping("/cancel/accepted/{matchId}")
    public ResponseEntity<String> cancelAcceptedMatch(
            @PathVariable Long matchId,
            Authentication auth
    ) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("💔 수락된 매칭 취소 - 사용자 ID: " + userId + ", 매칭 ID: " + matchId);
        matchingService.cancelAcceptedMatch(matchId, userId);
        return ResponseEntity.ok("수락된 매칭이 취소되었습니다.");
    }

    @PatchMapping("/travel-status")
    public ResponseEntity<String> updateTravelStatus(
            @RequestBody TravelStatusUpdateRequestDto request,
            Authentication auth
    ) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("🚗 여행 상태 업데이트 - 사용자 ID: " + userId + ", 계획 ID: " + request.getTravelPlanId() + ", 상태: " + request.getStatus());
        matchingService.updateTravelStatus(userId, request.getTravelPlanId(), request.getStatus());
        return ResponseEntity.ok("여행 상태가 변경되었습니다: " + request.getStatus());
    }



    @GetMapping("/my/sent") // 내가 보낸 모든 매칭 요청 조회
    public ResponseEntity<List<MatchResponseDto>> getSentRequests(Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("📤 보낸 요청 조회 - 사용자 ID: " + userId);
        return ResponseEntity.ok(matchingService.getMySentRequests(userId));
    }

    @GetMapping("/my/received") // 내가 받은 PENDING 요청만 조회
    public ResponseEntity<List<MatchResponseDto>> getReceivedRequests(Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("📥 받은 요청 조회 - 사용자 ID: " + userId);
        return ResponseEntity.ok(matchingService.getMyReceivedRequests(userId));
    }

    @GetMapping("/my/accepted") // 내가 포함된 ACCEPTED 매칭 조회
    public ResponseEntity<List<MatchResponseDto>> getAcceptedMatches(Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("✅ 수락된 매칭 조회 - 사용자 ID: " + userId);
        return ResponseEntity.ok(matchingService.getMyAcceptedMatches(userId));
    }

    // 🔧 새로 추가: 내가 거절한 매칭 목록 조회
    @GetMapping("/my/rejected")
    public ResponseEntity<List<MatchResponseDto>> getRejectedMatches(Authentication auth) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("🚫 거절한 매칭 조회 - 사용자 ID: " + userId);
        return ResponseEntity.ok(matchingService.getMyRejectedMatches(userId));
    }

    // 🔧 새로 추가: 거절한 매칭 취소 (다시 추천 목록에 나오게)
    @DeleteMapping("/unreject/{matchingId}")
    public ResponseEntity<String> unrejectMatch(
            @PathVariable Long matchingId,
            Authentication auth
    ) {
        // 🔧 실제 인증된 사용자 ID 사용
        Long userId = ((CustomUserDetails) auth.getPrincipal()).getUserId();
        
        System.out.println("🗑️ 거절 취소 요청 - 사용자 ID: " + userId + ", 매칭 ID: " + matchingId);
        matchingService.unrejectMatch(matchingId, userId);
        return ResponseEntity.ok("거절 취소가 완료되었습니다. 해당 사용자가 다시 추천 목록에 나타날 수 있습니다.");
    }
}
