package com.main.TravelMate.match.service;

import com.main.TravelMate.match.domain.MatchingStatus;
import com.main.TravelMate.match.dto.MatchRecommendationDto;
import com.main.TravelMate.match.dto.MatchRequestDto;
import com.main.TravelMate.match.dto.MatchResponseDto;

import java.util.List;

public interface MatchingService {
    List<MatchRecommendationDto> getRecommendations(Long userId);
    Long sendRequest(Long senderId, MatchRequestDto request);
    void respondToRequest(Long matchId, MatchingStatus status);
    void cancelRequest(Long matchId, Long senderId);
    void rejectPlan(Long senderId, Long planId);
    void cancelAcceptedMatch(Long matchId, Long userId);
    List<MatchResponseDto> getMyReceivedRequests(Long userId);
    List<MatchResponseDto> getMyAcceptedMatches(Long userId);
    List<MatchResponseDto> getMySentRequests(Long userId);
    void updateTravelStatus(Long userId, Long travelPlanId, String status);
    
    // 🔧 새로 추가: 거절한 매칭 관리
    List<MatchResponseDto> getMyRejectedMatches(Long userId);
    void unrejectMatch(Long matchingId, Long userId);
}
