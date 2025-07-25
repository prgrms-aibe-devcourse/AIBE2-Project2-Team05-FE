package com.main.TravelMate.matching.controller;

import com.main.TravelMate.matching.domain.MatchingStatus;
import com.main.TravelMate.matching.dto.MatchingRequestDto;
import com.main.TravelMate.matching.dto.MatchingResponseDto;
import com.main.TravelMate.matching.service.MatchingRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/match")
public class MatchingRequestController {

    private final MatchingRequestService matchingService;

    @PostMapping
    public ResponseEntity<?> sendRequest(@RequestBody MatchingRequestDto requestDto,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        matchingService.sendMatchingRequest(userDetails.getUsername(), requestDto);
        return ResponseEntity.ok("매칭 요청 전송 완료");
    }

    @PatchMapping("/{id}")
    public ResponseEntity<?> updateStatus(@PathVariable Long id,
                                          @RequestParam MatchingStatus status) {
        matchingService.updateStatus(id, status);
        return ResponseEntity.ok("상태 업데이트 완료");
    }

    @GetMapping("/sent")
    public ResponseEntity<List<MatchingResponseDto>> mySentRequests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchingService.getMySentRequests(userDetails.getUsername()));
    }

    @GetMapping("/received")
    public ResponseEntity<List<MatchingResponseDto>> receivedRequests(@AuthenticationPrincipal UserDetails userDetails) {
        return ResponseEntity.ok(matchingService.getReceivedRequests(userDetails.getUsername()));
    }
}
